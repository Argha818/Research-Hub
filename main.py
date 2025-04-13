from fastapi import FastAPI, Query
from pydantic import BaseModel
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi.middleware.cors import CORSMiddleware

# Load and preprocess data
df = pd.read_csv('arxiv_data.csv')
df['text'] = df['titles'] + ' ' + df['summaries']

# Vectorization
vectorizer = TfidfVectorizer(stop_words='english')
vectors = vectorizer.fit_transform(df['text'])

# FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)


class PaperRequest(BaseModel):
    query: str
    top_n: int = 5

@app.post('/recommend/')
def recommend_papers(request: PaperRequest):
    query_vec = vectorizer.transform([request.query])
    similarities = cosine_similarity(query_vec, vectors).flatten()
    top_indices = similarities.argsort()[-request.top_n:][::-1]
    
    recommendations = []
    for index in top_indices:
        recommendations.append({
            'title': df.iloc[index]['titles'],
            'summary': df.iloc[index]['summaries'],
            'terms': df.iloc[index]['terms']
        })

    return {'recommendations': recommendations}








# Run using: uvicorn filename:app --reload
