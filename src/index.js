import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    const port = process.env.PORT || 8080
    app.on("error", (error) => {
      console.error("SERVER connection failed: ", error);
    })
    app.listen(port, () => {
      console.log(`Server up and running on port ${port}`);
    })
  })
  .catch((error) => {
    console.error("MongoDB connection failed !!!", error);
  })



/* 

  APPROACH - 1 (Sab ek file me kardo - Not professional)
  import express from "express"

  const app = express();
  # ******** IIFE (Immediately Invoked Function Expression) function ********
  ;(async () => {
    try {
      await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
      app.on("error", (err) => {
        console.error("Error: ", err);
        throw err
      })
      console.log("DB connected")
      app.listen(process.env.PORT, () => {
        console.log(`Server up and running on http://localhost:${process.env.PORT}`)
      })
    } catch (error) {
      console.error("Error: ",error)
    }
  })()

*/