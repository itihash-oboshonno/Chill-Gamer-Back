require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_DOROJARTALA}@cluster0.umlhq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db("AllReviewsDB");
    const allReviews = database.collection('AllReviews');
    const wishList = database.collection('WishList');
    const userColl = database.collection('UserColl');

    app.get('/reviews', async(req, res)=> {
      const cursor = allReviews.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/topreviews', async(req, res)=> {
      const cursor = allReviews.find().sort({ rating: 1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    })

    // sort and filter for allreviews page
    app.get('/reviewsforall', async(req, res)=> {
      const sortBy = req.query.sortBy || 'none';
      const filterBy =  req.query.filterBy || 'none';
      // filter er jonne
      let query = {};
      if (filterBy !== 'none') {
        query = { genre: filterBy };
      }
      // sort er jonne
      let sort = {};
      if (sortBy === 'rating') {
        sort = { rating: 1 };
      } else if (sortBy === 'year') {
        sort = { year: 1 };
      }

      const data = await allReviews.find(query).sort(sort).toArray();
      res.json(data);
    })

    app.get('/myreviews', async(req, res)=> {
      const {searchParams} = req.query;
      let option = {email: searchParams};
      const cursor = allReviews.find(option);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/reviews/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const review = await allReviews.findOne(query);
      res.send(review);
    })

    app.get('/wishlist', async(req, res)=> {
      const cursor = wishList.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/mywatchlist', async(req, res)=> {
      const {searchParams} = req.query;
      let option = {wishListsUser: searchParams};
      const cursor = wishList.find(option);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/reviews', async(req, res)=> {
      const notunReview = req.body;
      const result = await allReviews.insertOne(notunReview);
      res.send(result);
    })

    app.post('/wishlist', async(req, res)=> {
      const wishItem = req.body;
      const result = await wishList.insertOne(wishItem);
      res.send(result);
    })

    app.post('/usercoll', async(req, res)=> {
      const user = req.body;
      const result = await userColl.insertOne(user);
      res.send(result);
    })

    app.put('/reviews/:id', async(req, res)=> {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedRev = req.body;
      const theNewRev = {
        $set: {
          title: updatedRev.title,
          image: updatedRev.image,
          review: updatedRev.review,
          rating: updatedRev.rating,
          year: updatedRev.year,
          genre: updatedRev.genre,
          email: updatedRev.email,
          userName: updatedRev.userName,
        }
      }
      const result = await allReviews.updateOne(filter, theNewRev, options);
      res.send(result);
    })

    app.delete('/reviews/:id', async(req, res)=> {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await allReviews.deleteOne(query);
      res.send(result);
    })

    app.delete('/mywatchlist/:id', async(req, res)=> {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await wishList.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);


app.get('/', (req, res) => {
    res.send('Chill-Gamer Server is Running')
})

app.listen(port, () => {
    console.log(`Chill-Gamer Server is running on port: ${port}`)
})