import connectDB from "./db/index.js";

connectDB();



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