const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Tyre = require('./tyres');

mongoose.connect(
	'mongodb+srv://joebi1kenobi:jm721348@cluster0.kryx6.mongodb.net/tyres?retryWrites=true&w=majority',
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}
);
const db = mongoose.connection;

app.get('/Tyres', paginatedResults(Tyre), (req, res) => {
	// var allowedOrigins = ['https://motoreasyreact.herokuapp.com/', 'localhost'];
	const origin = req.headers.origin;
	res.setHeader('Access-Control-Allow-Origin', origin);
	res.json(res.paginatedResults);
});

function paginatedResults(model) {
	return async (req, res, next) => {
		const page = parseInt(req.query.page);
		const limit = parseInt(req.query.limit);
		const name = req.query.name;
		const size = req.query.size;
		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;
		var query = {};
		const results = {};

		if (name && size) {
			query = { name: name, size: size };
		} else if (name) {
			query = { name: name };
		} else if (size) {
			query = { size: size };
		}

		if (endIndex < (await model.countDocuments().exec())) {
			results.next = {
				page: page + 1,
				limit: limit,
			};
		}

		if (startIndex > 0) {
			results.previous = {
				page: page - 1,
				limit: limit,
			};
		}

		try {
			results.results = await model.find(query).limit(limit).skip(startIndex).exec();
			res.paginatedResults = results;
			next();
		} catch (e) {
			res.status(500).json({ message: e.message });
		}
	};
}

app.listen(process.env.PORT || 8080);
