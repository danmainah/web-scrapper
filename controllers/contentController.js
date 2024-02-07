const User = require('../models/userModel')
const Content = require('../models/contentModel')
const cheerio = require('cheerio')
const axios = require('axios')
exports.getContent = async (req, res) => {
  const data = await Content.find({});
  //filter the content to dislay content that belongs to the logged in user
  const id = req.session.userId;
  const content = data.filter(content => content.author.toString() === id);
  console.log(content)
  res.render('index', { content });
};

exports.scrape = async (req, res) => {
  const {title, url} = req.body;
  const id = req.session.userId;
  console.log(id)
  let scrapped = [];

  if(!title || !url) {
    return res.status(401).send('<h2>Please provide a title and URL.></h2><a href="./">Back</a');
  }

  function isUrl(string) {
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '(((a-z\\d*)\\.)+[a-z]{2,}|'+ // domain name and extension
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return urlPattern.test(string);
  }

  if (isUrl(title)) {
  return res.status(401).send('<h2>Please provide a valid title. Title should not be a URL.</h2><a href="../">Back</a');
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
    if (!scrapped || scrapped.length === 0) {
      return res.status(400).send('No scrapped data to save');
    }
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
    // Handle error but check if error first include  E11000 duplicate key error 
    if(err.code === 11000) {
      return res.status(400).send('Title already used by another scrapped content');
    }
    console.error(err);
    res.status(500).send('An error occurred while saving the scrapped data + ' + err + ' <a href="../">Back</a' );
  }
}

exports.getScrapped = async (req, res) => {
  const filter = { title: req.params.title };
  const content = await Content.findOne( filter);
  console.log(content);
  res.render('content/view', { content });
};

exports.editScrappedGet = async (req, res) => {
  const filter = { title: req.params.title };
  // Check if the content belongs to the logged in user before delete
  const id = req.session.userId;
  const contentAuthor = await Content.findOne( filter);
  if(contentAuthor.author.toString() !== id) {
    return res.status(401).send('<h3>You are not authorized to edit this content.</h3><a href="../">Back</a>');
  }
  const content = await Content.findOne( filter);
  res.render('content/edit', {content} )
}

exports.editScrappedPost = async (req, res) => {
  const cont = await Content.find({});
  //filter the content to dislay content that belongs to the logged in user
  const id = req.session.userId;
  const content = cont.filter(content => content.author.toString() === id);

  const { title, data } = req.body;
  let update = {};

  // Check if title exists in the request body
  if (title !== undefined) {
    update.title = content.title;
  }

  // Check if data exists in the request body
  if (data !== undefined) {
    update.data = content.data;
  }

  try {
    // Find the document by title and update it with the new title or data
    const updatedContent = await Content.findOneAndUpdate(
      { title: title },
      { $set: update },
      { new: true }
    );

    res.redirect(`/content/view/${updatedContent.title}`);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.deleteScrapped = async (req, res) => {
  const filter = { title: req.params.title };
  // Check if the content belongs to the logged in user before delete
  const id = req.session.userId;
  const contentAuthor = await Content.findOne( filter);
  if(contentAuthor.author.toString() !== id) {
    return res.status(401).send('<h3>You are not authorized to delete this content.</h3><a href="../">Back</a>');
  }
  
  const content = await Content.findOneAndDelete( filter);
  console.log(content);
  res.redirect('../');
}