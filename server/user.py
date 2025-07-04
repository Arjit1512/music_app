from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
import redis.asyncio as redis
from datetime import datetime,timezone
from bson import ObjectId
from dotenv import load_dotenv
import boto3
import os
from uuid import uuid4
import json



app = FastAPI()

load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use ["http://localhost:8081"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REDIS_URL = os.getenv("REDIS_URL")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)


@app.get("/")
def index():
    return {"Message":"Success!"}

MONGO_URL=os.getenv("MONGO_URL")
DB_NAME=os.getenv("DB_NAME")

# database = AsyncIOMotorClient(MONGO_URL)
# db = database[DB_NAME]
# collection = db["users"]
# reviews = db["reviews"]

# Dependency to get the database connection
async def get_db():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    return db


class Review(BaseModel):
    type: str 
    spotifyId : str  
    img : str 
    stars: int
    comment : str  
    date: Optional[str] = None

class User(BaseModel):
    username : str = ''
    password : str = ''
    dp: str = ''
    reviews :  List[Review] = []
    friends : List[str] = []



# S3 Configuration

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)

BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

async def upload_file_to_s3(file: UploadFile) -> str:
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{uuid4()}.{file_extension}"
    file_key = f"musicboard/{unique_filename}"

    try:
        s3.upload_fileobj(
            file.file,
            BUCKET_NAME,
            file_key,
            ExtraArgs={"ContentType": file.content_type}
        )
        file_url = f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{file_key}"
        return file_url
    except Exception as e:
        raise Exception(f"S3 upload failed: {str(e)}")






# dp: UploadFile = File(...) is Equivalent of upload.single("dp")

# login-section
@app.post("/register")
async def register(username: str = Form(...), password: str = Form(...), dp: UploadFile = File(...)): # this input indicates multipart/form-data
    if username=='' or password=='':
        return {"Message": "username and password are required!"}
    
    db = await get_db()
    collection = db["users"]
    existinguser = await collection.find_one({"username" : username})
    if existinguser:
        return {"Message" : "User already exists with same username!"}
    
    file_url = await upload_file_to_s3(dp)
    
    newuser = {
        "username" : username,
        "password" : password,
        "dp" : file_url
    }
    result = await collection.insert_one(newuser)
    answer = result.inserted_id
    answer = str(answer)
    return {"Message": "User added successfully!", "userId" : answer, "dp" : file_url}


@app.post("/login")
async def login(user: User):
    db = await get_db()
    collection = db["users"]
    if user.username=='' or user.password=='':
        return {"Message": "username and password are required!"}
    
    existinguser = await collection.find_one({"username": user.username})
    if not existinguser:
        return {"Message":"User does not exists!"}

    if user.password != existinguser["password"]:
        return {"Message": "Wrong password entered!"}
    
    result = existinguser["_id"]
    result = str(result)
    
    return {"Message": "User logged in successfully!", "userId" : result}
    
# review-album-section
@app.post("/{id}/add-review/{albumId}")
async def add_review(id: str, review: Review):
    db = await get_db()
    collection = db["users"]
    reviews = db["reviews"]
    existinguser = await collection.find_one({"_id": ObjectId(id)})
    
    if not existinguser:
        return {"Error":"User does not exists!"}
    print(f"Received data: {review}")
    newreview = review.model_dump() #replacing dict with model_dump since dict is depreciated
    newreview["userId"] = id
    newreview["username"] = existinguser["username"]
    newreview["date"] = datetime.now(timezone.utc).isoformat()

    result = await reviews.insert_one(newreview)
    newreview_id = str(result.inserted_id)
    
    await collection.update_one({"_id":ObjectId(id)}, {"$push" : {"reviews": newreview_id}})
    
    # Invalidate global cache
    await redis_client.delete("global:reviews")


    return {"Message": "Review added successfully" , "new_review_id":newreview_id}
    
@app.delete("/{id}/delete-review/{review_id}")
async def delete_review(id:str, review_id: str):
    db = await get_db()
    collection = db["users"]
    reviews = db["reviews"]
    existinguser = await collection.find_one({"_id" : ObjectId(id)})
    if not existinguser:
        return {"Error":"User does not exists!"}
    
    review = await reviews.find_one({"_id":ObjectId(review_id)})
    if not review:
        return {"Error":"Review does not exists!"}
    await collection.update_one({"_id":ObjectId(id)} , {"$pull" : {"reviews" : review_id}})
    await reviews.delete_one({"_id":ObjectId(review_id)})

    # Invalidate global cache
    await redis_client.delete("global:reviews")


    return {"Message": "Review deleted successfully"}

@app.get("/{id}/reviews")
async def show_reviews(id:str):
    db = await get_db()
    collection = db["users"]
    reviews = db["reviews"]
    try:
        existinguser = await collection.find_one({"_id" : ObjectId(id)})
    except:
        return {"SOME ERROR"}
    
    if not existinguser:
        return {"Message": "User does not exists!"}
    
    
    result = await reviews.find({"userId":id}).to_list(length=100)
    for review in result:
        review["_id"] = str(review["_id"])  # Convert ObjectId to string
    return result

@app.get("/reviews")
async def get_reviews():
    db = await get_db()
    reviews = db["reviews"]

    try:
        cached_array = await redis_client.get("global:reviews")
        if cached_array:
            return {"Message": "Reviews fetched successfully from Redis!", "reviews": json.loads(cached_array)}
    except Exception as e:
        print("Redis GET error:", e)

    array = await reviews.find().sort("date", -1).to_list(length=100)
    for review in array:
        review["_id"] = str(review["_id"])

    try:
        await redis_client.set("global:reviews", json.dumps(array), ex=86400)
    except Exception as e:
        print("Redis SET error:", e)

    return {"Message": "Reviews fetched successfully from MongoDB!", "reviews": array}




















@app.get("/show-reviews/{spotifyId}")
async def showReviews(spotifyId: str):
    db = await get_db()
    reviews = db["reviews"]
    result = await reviews.find({"spotifyId": spotifyId}).to_list(length=20)
    for review in result:
        review["_id"] = str(review["_id"])
    return {"Message": "Reviews fetched successfully!", "reviews" : result}





# friends-section
@app.post("/{id}/add-friend/{friendId}")
async def add_friend(id:str,friendId:str):
    db = await get_db()
    collection = db["users"]
    existinguser = await collection.find_one({"_id" : ObjectId(id)})
    friend = await collection.find_one({"_id" : ObjectId(friendId)})
    if id == friendId:
        return {"Error":"You can't add yourself!"}
    if not existinguser:
        return {"Error":"User does not exists!"}
    if not friend:
        return {"Error":"Friend does not exists!"}
    if friendId in existinguser.get("friends", []):
        await collection.update_one({"_id": ObjectId(id)} , {"$pull" : {"friends" : friendId}})
        await collection.update_one({"_id": ObjectId(friendId)} , {"$pull" : {"friends" : id}})
        return {"Message": "Friend deleted successfully"}
    
    await collection.update_one({"_id": ObjectId(id)} , {"$push" : {"friends" : friendId}})
    await collection.update_one({"_id": ObjectId(friendId)} , {"$push" : {"friends" : id}}) 
    return {"Message": "Friend added successfully"}
    
    
# get-user-info
@app.get("/get-details/{id}")
async def get_details(id: str):
    db = await get_db()
    collection = db["users"]
    user = await collection.find_one({"_id":ObjectId(id)})
    if not user:
        return {"Error":"User does not exists!"}
    user["_id"] = str(user["_id"])
    return {"Message": user}
