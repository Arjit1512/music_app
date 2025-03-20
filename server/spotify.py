from fastapi import FastAPI
from dotenv import load_dotenv
import os

app = FastAPI()
load_dotenv()

SCI = os.getenv('SPOTIFY_CLIENT_ID')
SCS = os.getenv('SPOTIFY_CLIENT_SECRET')

#get artists based on search
@app.get("https://api.spotify.com/v1/search?q=Pitbull&type=artist")
def get_artists():
    array = []