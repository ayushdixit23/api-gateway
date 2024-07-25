const express = require('express');
const axios = require('axios');
const router = express.Router();
const multer = require("multer")
const registry = require("../registry.json")
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const FormData = require('form-data');

router.all("/:apiName/*", upload.any(), async (req, res) => {
	try {
		// console.log("Received request");

		const { apiName } = req.params;
		const path = req.params[0];
		// console.log(`apiName: ${apiName}, path: ${path}`);

		if (registry.services[apiName]) {

			const formattedPath = path.startsWith('/') ? path.substring(1) : path;
			const baseUrl = `${registry.services[apiName].url}${registry.services[apiName].apiName}/${formattedPath}`;

			const queryString = new URLSearchParams(req.query).toString();
			const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
			// console.log(`Full URL: ${fullUrl}`);

			console.log('Request method:', req.method);
			console.log('Request headers:', req.headers);
			console.log('Request body:', req.body);
			console.log('Request file:', req.files);

			let axiosConfig = {
				method: req.method,
				url: fullUrl,
				headers: {}
			};

			if (req.files && req.files.length > 0) {
				const formData = new FormData();

				// Append files
				req.files.forEach(file => {
					formData.append(file.fieldname, file.buffer, { filename: file.originalname, contentType: file.mimetype });
				});

				// Append other fields
				Object.keys(req.body).forEach(key => {
					formData.append(key, req.body[key]);
				});

				axiosConfig.data = formData;
				axiosConfig.headers = {
					"Content-Type": "multipart/form-data"
				};
			} else {
				axiosConfig.data = req.body;
				axiosConfig.headers['Content-Type'] = 'application/json';
			}

			// console.log(axiosConfig, "axios")
			const resp = await axios(axiosConfig);

			// console.log("Response received from service:", resp.data);
			res.send(resp.data);
		} else {
			console.log("API Name doesn't exist");
			res.status(404).send("API Name doesn't exist!");
		}
	} catch (error) {
		console.error("Error handling request:", error);
		res.status(400).send("Internal Server Error");
	}
});


module.exports = router;
