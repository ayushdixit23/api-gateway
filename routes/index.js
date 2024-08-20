const express = require('express');
const axios = require('axios');
const router = express.Router();
const multer = require("multer")
const registry = require("../registry.json")
const fs = require('fs');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '/tmp');  // Temporary directory for uploads
	},
	filename: function (req, file, cb) {
		cb(null, `${file.originalname}`);
	}
});
const upload = multer({
	storage: storage,
	limits: { fileSize: 10000000000000000000000000000000000000000000000000000000000000000 },
});

const FormData = require('form-data');

// router.all("/:apiName/*", upload.any(), async (req, res) => {
// 	try {
// 		const { apiName } = req.params;
// 		const path = req.params[0];

// 		if (registry.services[apiName]) {

// 			const formattedPath = path.startsWith('/') ? path.substring(1) : path;
// 			const baseUrl = `${registry.services[apiName].url}${registry.services[apiName].apiName}/${formattedPath}`;

// 			const queryString = new URLSearchParams(req.query).toString();
// 			const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

// 			console.log('Request method:', req.method);
// 			console.log('Request headers:', req.headers);
// 			console.log('Request body:', req.body);
// 			console.log('Request file:', req.files);

// 			let axiosConfig = {
// 				method: req.method,
// 				url: fullUrl,
// 				headers: {}
// 			};

// 			if (req.files && req.files.length > 0) {
// 				const formData = new FormData();

// 				// Append files
// 				req.files.forEach(file => {
// 					formData.append(file.fieldname, file.buffer, { filename: file.originalname, contentType: file.mimetype });
// 				});

// 				// Append other fields
// 				Object.keys(req.body).forEach(key => {
// 					formData.append(key, req.body[key]);
// 				});

// 				axiosConfig.data = formData;
// 				axiosConfig.headers = {
// 					"Content-Type": "multipart/form-data"
// 				};
// 			} else {
// 				axiosConfig.data = req.body;
// 				axiosConfig.headers['Content-Type'] = 'application/json';
// 			}

// 			// console.log(axiosConfig, "axios")
// 			const resp = await axios(axiosConfig);

// 			// console.log("Response received from service:", resp.data);
// 			res.send(resp.data);
// 		} else {
// 			console.log("API Name doesn't exist");
// 			res.status(404).send("API Name doesn't exist!");
// 		}
// 	} catch (error) {
// 		console.error("Error handling request:", error);
// 		res.status(400).send("Internal Server Error");
// 	}
// });


router.all('/:apiName/*', upload.any(), async (req, res) => {
	try {
		const { apiName } = req.params;
		const path = req.params[0];

		if (registry.services[apiName]) {
			const formattedPath = path.startsWith('/') ? path.substring(1) : path;
			const baseUrl = `${registry.services[apiName].url}${registry.services[apiName].apiName}/${formattedPath}`;

			const queryString = new URLSearchParams(req.query).toString();
			const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

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

				// Append files by reading from disk (streaming)
				req.files.forEach(file => {
					formData.append(file.fieldname, fs.createReadStream(file.path), { filename: file.originalname, contentType: file.mimetype });
				});

				// Append other fields
				Object.keys(req.body).forEach(key => {
					formData.append(key, req.body[key]);
				});

				axiosConfig.data = formData;
				axiosConfig.headers = {
					...formData.getHeaders() // Get correct headers for form-data
				};
			} else {
				axiosConfig.data = req.body;
				axiosConfig.headers['Content-Type'] = 'application/json';
			}

			const resp = await axios(axiosConfig);

			res.send(resp.data);

			// Clean up the temporary files
			req.files.forEach(file => fs.unlinkSync(file.path));
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
