const express = require('express');
const stream = require('stream');
const tts = require('@google-cloud/text-to-speech');
const { PrismaClient } = require("@prisma/client");
const sendgrid = require('@sendgrid/mail');
const config = require("../config");

sendgrid.setApiKey(config.sendGridApiKey);
const router = express.Router();
const prisma = new PrismaClient();


router.get('/', async (req, res) => {
  const records = await prisma.post.findMany({
    orderBy: [{ createdAt: 'desc' }]
  });
  const posts = records.map(record => ({
    ...record,
    audioUrl: `/audio?text=${encodeURI(record.text)}`
  }));
  res.render('index', { posts });
});

router.get('/audio', async (req, res) => {
  const text = req.query.text;
  const client = new tts.TextToSpeechClient();
  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3' },
  });
  const readStream = new stream.PassThrough();
  readStream.end(response.audioContent);
  res.set("Content-disposition", 'attachment; filename=' + 'audio.mp3');
  res.set("Content-Type", "audio/mpeg");
  readStream.pipe(res);
});

router.post('/post', async (req, res) => {
  const { body } = req;
  console.log(body)

  await prisma.post.create({
    data: body
  });

  await sendgrid.send({
    to: body.creatorEmail,
    from: 'faisal.pindar@ontariotechu.net',
    subject: 'Post created!',
    text: `Post created "${body.text}", thanks!`
  });

  return res.redirect('/');
});

router.get('/vote', async (req, res) => {
  const { id, n } = req.query;
  await prisma.post.update({
    where: {
      id: parseInt(id),
    },
    data: {
      votes: {
        increment: parseInt(n)
      }
    }
  });
  res.redirect('/');
});

module.exports = router;
