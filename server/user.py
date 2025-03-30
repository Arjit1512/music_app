from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List
from datetime import datetime,timezone
from bson import ObjectId
from mangum import Mangum
from dotenv import load_dotenv
import os

app = FastAPI()

load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use ["http://localhost:8081"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def index():
    return {"Message":"Success!"}

MONGO_URL=os.getenv("MONGO_URL")
DB_NAME=os.getenv("DB_NAME")

database = AsyncIOMotorClient(MONGO_URL)
db = database[DB_NAME]
collection = db["users"]
reviews = db["reviews"]

class Review(BaseModel):
    type: str 
    spotifyId : str  
    img : str 
    stars: int
    comment : str  
    date: str | None = None

class User(BaseModel):
    username : str = ''
    password : str = ''
    reviews :  List[Review] = []
    friends : List[str] = []

@app.post("/register")
async def register(user: User):
    if user.username == '' or user.password == '':
        return {"Message": "username and password are required!"}
    try:
        existinguser = await app.collection.find_one({"username": user.username})
        if existinguser:
            return {"Message": "User already exists with same username!"}
        newuser = user.model_dump()
        result = await app.collection.insert_one(newuser)
        answer = str(result.inserted_id)
        return {"Message": "User added successfully!", "userId": answer}
    except Exception as e:
        print(f"Error in register: {e}")
        return {"Error": "Internal server error", "details": str(e)}

# # login-section
# @app.post("/register")
# async def register(user: User):
#     if user.username=='' or user.password=='':
#         return {"Message": "username and password are required!"}
#     existinguser = await collection.find_one({"username" : user.username})
#     if existinguser:
#         return {"Message" : "User already exists with same username!"}
#     newuser = user.model_dump() #replacing dict with model_dump since dict is depreciated
#     result = await collection.insert_one(newuser)
#     answer = result.inserted_id
#     answer = str(answer)
#     return {"Message": "User added successfully!", "userId" : answer}

# @app.post("/login")
# async def login(user: User):
#     if user.username=='' or user.password=='':
#         return {"Message": "username and password are required!"}
    
#     existinguser = await collection.find_one({"username": user.username})
#     if not existinguser:
#         return {"Message":"User does not exists!"}

#     if user.password != existinguser["password"]:
#         return {"Message": "Wrong password entered!"}
    
#     result = existinguser["_id"]
#     result = str(result)
    
#     return {"Message": "User logged in successfully!", "userId" : result}
    
# # review-album-section
# @app.post("/{id}/add-review/{albumId}")
# async def add_review(id: str, review: Review):
#     existinguser = await collection.find_one({"_id": ObjectId(id)})
    
#     if not existinguser:
#         return {"Error":"User does not exists!"}
#     print(f"Received data: {review}")
#     newreview = review.model_dump()
#     newreview["userId"] = id
#     newreview["username"] = existinguser["username"]
#     newreview["date"] = datetime.now(timezone.utc).isoformat()

#     result = await reviews.insert_one(newreview)
#     newreview_id = str(result.inserted_id)
    
#     await collection.update_one({"_id":ObjectId(id)}, {"$push" : {"reviews": newreview_id}})

#     return {"Message": "Review added successfully" , "new_review_id":newreview_id}
    
# @app.delete("/{id}/delete-review/{review_id}")
# async def delete_review(id:str, review_id: str):
#     existinguser = await collection.find_one({"_id" : ObjectId(id)})
#     if not existinguser:
#         return {"Error":"User does not exists!"}
    
#     review = await reviews.find_one({"_id":ObjectId(review_id)})
#     if not review:
#         return {"Error":"Review does not exists!"}
#     await reviews.delete_one({"_id":ObjectId(review_id)})
#     await collection.update_one({"_id":ObjectId(id)} , {"$pull" : {"reviews" : review_id}})
#     return {"Message": "Review deleted successfully"}

# @app.get("/{id}/reviews")
# async def show_reviews(id:str):
#     try:
#         existinguser = await collection.find_one({"_id" : ObjectId(id)})
#     except:
#         return {"SOME ERROR"}
    
#     if not existinguser:
#         return {"Message": "User does not exists!"}
    
    
#     result = await reviews.find({"userId":id}).to_list(length=100)
#     for review in result:
#         review["_id"] = str(review["_id"])  # Convert ObjectId to string
#     return result

# @app.get("/reviews")
# async def get_reviews():
#     array = await reviews.find().sort("date", -1).to_list(20) # to find latest 10 reviews
#     for review in array:
#         review["_id"] = str(review["_id"])
#     return {"Message":"Reviews fecthed successfully!", "reviews": array}








# # friends-section
# @app.post("/{id}/add-friend/{friendId}")
# async def add_friend(id:str,friendId:str):
#     existinguser = await collection.find_one({"_id" : ObjectId(id)})
#     friend = await collection.find_one({"_id" : ObjectId(friendId)})
#     if id == friendId:
#         return {"Error":"You can't add yourself!"}
#     if not existinguser:
#         return {"Error":"User does not exists!"}
#     if not friend:
#         return {"Error":"Friend does not exists!"}
#     if friendId in existinguser.get("friends", []):
#         await collection.update_one({"_id": ObjectId(id)} , {"$pull" : {"friends" : friendId}})
#         await collection.update_one({"_id": ObjectId(friendId)} , {"$pull" : {"friends" : id}})
#         return {"Message": "Friend deleted successfully"}
    
#     await collection.update_one({"_id": ObjectId(id)} , {"$push" : {"friends" : friendId}})
#     await collection.update_one({"_id": ObjectId(friendId)} , {"$push" : {"friends" : id}}) 
#     return {"Message": "Friend added successfully"}
    
    
# # get-user-info
# @app.get("/get-details/{id}")
# async def get_details(id: str):
#     user = await collection.find_one({"_id":ObjectId(id)})
#     if not user:
#         return {"Error":"User does not exists!"}
#     user["_id"] = str(user["_id"])
#     return {"Message": user}


# # # At the very end of your file, make sure this is the last thing for the deployment of VERCEL:
# # handler = Mangum(app, lifespan="off")


