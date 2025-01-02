import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;

export async function GET() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('trello-clone');
    const board = await db.collection('boards').findOne({ name: 'nepa-grl' });
    
    await client.close();

    if (!board) {
      // Return empty lists if no board exists yet
      return new Response(JSON.stringify({ lists: [] }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify(board), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('trello-clone');
    
    // Upsert - update if exists, insert if doesn't
    const result = await db.collection('boards').updateOne(
      { name: 'nepa-grl' },
      { 
        $set: { 
          lists: data.lists,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    await client.close();

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}