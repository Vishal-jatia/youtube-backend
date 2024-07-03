
import express from 'express'

const app = express();
const port = process.env.PORT | 3000

app.listen(port, () => {
  console.log(`Server Up and Running on port http://localhost:${port}`)
})