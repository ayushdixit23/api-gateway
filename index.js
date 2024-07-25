const express = require("express")
const cors = require("cors")
const app = express()
const morgan = require("morgan")
require("dotenv").config()
const apiRoutes = require("./routes/index")

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"))
app.use("/api", apiRoutes)

app.listen(process.env.PORT, () => {
	console.log(`Server Listening on ${process.env.PORT}`)
})
