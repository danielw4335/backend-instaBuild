export default {
  dbURL: process.env.MONGO_URL || 'mongodb+srv://danielWallache:6543355@cluster0.k53mbev.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  dbName : process.env.DB_NAME || 'story_db'
}
