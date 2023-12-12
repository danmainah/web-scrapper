const User = require('../models/userModel')
const Content = require('../models/contentModel')
const cheerio = require('cheerio')
const axios = require('axios')
exports.getContent = async (req, res) => {
  const content = await Content.find();
  res.render('index', { content });
};

exports.scrape = async (req, res) => {
  const {title, url} = req.body;
  const id = req.session.userId;
  let scrapped = [];

  if(!title || !url) {
    return res.status(400).send({ error: 'Please provide a title and URL.' });
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    $('table tr').each((index, element) => {
      const tds = $(element).find('td');
      const tableRow = {};
      $(tds).each((i, el) => {
        // Adjust this to match the structure of your table
        tableRow[`property${i}`] = $(el).text();
      });
      scrapped.push(tableRow);
    });
    console.log(scrapped);
  }
  catch (error) {
    return res.status(500).send({ error: 'An error occurred while scraping.' });
  }

  try {
    // Save the scrapped data
    const content = new Content({
      title: req.body.title,
      data: scrapped,
      author: id,
    });

    await content.save();
    
    // Add content to user posts array
    await User.findOneAndUpdate(
      { _id: id },
      { $push: { Contents: content } },
    )

    // Redirect after successful save
    res.redirect('./');
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).send('An error occurred while saving the scrapped data + ' + err);
  }
}
