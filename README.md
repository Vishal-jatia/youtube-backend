                     
<h1 align="center" style="font-weight: bold;">Backend for video streaming platform like youtube 💻</h1>

<p align="center">
<a href="#tech">Technologies</a>
<a href="#started">Getting Started</a>
<a href="#routes">API Endpoints</a>
</p>

<p align="center">This is a production ready complete backend for a video streaming platform where a user can upload all its videos, watch other's videos and get stats about about his channel.</p>


<p align="center">
<a href="https://github.com/Vishal-jatia/youtube-backend">📱 Visit this Project</a>
</p>
<a href="https://app.eraser.io/workspace/JqCDVp5R1Pp8euYKkE9D">↗️ ER model link</a>
</p>

<h2 id="technologies">💻 Technologies</h2>

- NodeJs
- Javascript
- Mongoose and MongoDB
- Express

<h2 id="Reason">❔ Reasons to use mongoDB instead of a relational database</h2>

- For storing unstructured data.
- For accomodation large amounts of data.
- Due to the ease of handling request and response in JSON
- Ofcourse, to get lower latency🚀.
 
<h2 id="started">🚀 Getting started</h2>

Here you describe how to run your project locally
 
<h3>Prerequisites</h3>

Here you list all prerequisites necessary for running your project. For example:

- [NodeJS](https://nodejs.org/en)
- [MongoDB aggregation pipelines](https://www.mongodb.com/docs/manual/aggregation/)
 
<h3>Cloning</h3>

How to clone your project

```bash
git clone https://github.com/Vishal-jatia/youtube-backend.git
```
 
<h3>Config .env variables</h2>

Use the `.env.example` as reference to create your configuration file `.env` with your Credentials

```yaml
PORT=3000
MONGO_URI={YOUR_MONGO_URI}
CORS_ORIGIN={SET_CORS_ORIGIN}

ACCESS_TOKEN_SECRET={SET_ACCESS_TOKEN_SECRET}
ACCESS_TOKEN_EXPIRY={SET_EXPIRY}

REFRESH_TOKEN_SECRET={SET_ACCESS_TOKEN_SECRET}
REFRESH_TOKEN_EXPIRY={SET_EXPIRY}

CLOUDINARY_CLOUD_NAME={YOUR_CLOUDINARY_NAME}
CLOUDINARY_API_KEY={YOUR_CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET={YOUR_CLOUDINARY_SECRET}
```
 
<h3>Starting</h3>

How to start your project

```bash
cd project-name
npm run dev
```
 
<h2 id="routes">📍 API Endpoints</h2>

Here you can list the main routes of your API, and what are their expected request bodies.
​
| routes                        | description                                          
|----------------------|-----------------------------------------------------
| <kbd>/users</kbd>     | all user routes
| <kbd>/videos</kbd>     | all video routes
| <kbd>/comment</kbd>     | all comment routes
| <kbd>/playlist</kbd>     | all playlist routes
| <kbd>/subscription</kbd>     | all subscription routes
| <kbd>/like</kbd>     | all like routes  
| <kbd>/tweet</kbd>     | all tweet routes 
| <kbd>/dashboard</kbd>     | all dashboard routes

[↗️ Postman collection link. Click to see all the routes](https://documenter.getpostman.com/view/24263304/2sA3e4AUfP)

 
<h3>Documentations that might help</h3>

[📝 How to create a Pull Request](https://www.atlassian.com/br/git/tutorials/making-a-pull-request)

[💾 Commit pattern](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716)


