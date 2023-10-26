const User = require('../models/userModel')
const Content = require('../models/contentModel')
exports.getContent = async (req, res) => {
  const content = await Content.find();
  res.render('index', { content: content });
};

exports.scrape = async (req, res) => {
  const {title, url, sampleData} = req.body;
  const id = req.session.userId;
  let scrapped 

  if(!title || !url || !sampleData) {
    return res.status(400).send({ error: 'Please provide a title, URL and sample data.' });
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const result  = $(sampleData).text();
    scrapped = result
    console.log(scrapped)
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
      { $push: { activities: activity } },
    )

    // Redirect after successful save
    res.redirect('./');
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).send('An error occurred while creating the activity');
  }
}