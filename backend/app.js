import fs from 'node:fs/promises'; // Importing fs module for file system operations
import bodyParser from 'body-parser'; // Middleware to parse incoming request bodies
import express from 'express'; // Importing Express framework

const app = express(); // Creating an instance of Express

app.use(bodyParser.json()); // Middleware to parse JSON bodies
app.use(express.static('public')); // Serving static files from the 'public' directory

// Middleware for setting up CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );
  next();
});

// Endpoint to get events with optional filtering and limiting
app.get('/events', async (req, res) => {
  const { max, search } = req.query; // Extracting query parameters
  const eventsFileContent = await fs.readFile('./data/events.json'); // Reading events data from file
  let events = JSON.parse(eventsFileContent); // Parsing events JSON data

  // Filtering events based on search query if provided
  if (search) {
    events = events.filter((event) => {
      const searchableText = `${event.title} ${event.description} ${event.location}`;
      return searchableText.toLowerCase().includes(search.toLowerCase());
    });
  }

  // Limiting the number of events if max parameter is provided
  if (max) {
    events = events.slice(events.length - max, events.length);
  }

  // Sending response with formatted event data
  res.json({
    events: events.map((event) => ({
      id: event.id,
      title: event.title,
      image: event.image,
      date: event.date,
      location: event.location,
    })),
  });
});

// Endpoint to get all event images
app.get('/events/images', async (req, res) => {
  const imagesFileContent = await fs.readFile('./data/images.json'); // Reading images data from file
  const images = JSON.parse(imagesFileContent); // Parsing images JSON data

  // Sending response with image data
  res.json({ images });
});

// Endpoint to get a specific event by ID
app.get('/events/:id', async (req, res) => {
  const { id } = req.params; // Extracting event ID from request parameters

  // Reading events data from file
  const eventsFileContent = await fs.readFile('./data/events.json');
  const events = JSON.parse(eventsFileContent); // Parsing events JSON data

  // Finding the event with the specified ID
  const event = events.find((event) => event.id === id);

  // Sending response with the found event data, or a 404 error if not found
  if (!event) {
    return res
      .status(404)
      .json({ message: `For the id ${id}, no event could be found.` });
  }

  // Delaying response for demonstration purposes
  setTimeout(() => {
    res.json({ event });
  }, 1000);
});

// Endpoint to add a new event
app.post('/events', async (req, res) => {
  const { event } = req.body; // Extracting event data from request body

  // Handling missing event data
  if (!event) {
    return res.status(400).json({ message: 'Event is required' });
  }

  // Validating event data
  if (
    !event.title?.trim() ||
    !event.description?.trim() ||
    !event.date?.trim() ||
    !event.time?.trim() ||
    !event.image?.trim() ||
    !event.location?.trim()
  ) {
    return res.status(400).json({ message: 'Invalid data provided.' });
  }

  // Reading existing events data from file
  const eventsFileContent = await fs.readFile('./data/events.json');
  const events = JSON.parse(eventsFileContent); // Parsing events JSON data

  // Generating a new event ID and adding it to the events array
  const newEvent = {
    id: Math.round(Math.random() * 10000).toString(),
    ...event,
  };
  events.push(newEvent);

  // Writing updated events data back to file
  await fs.writeFile('./data/events.json', JSON.stringify(events));

  // Sending response with the newly added event
  res.json({ event: newEvent });
});

// Endpoint to update an existing event
app.put('/events/:id', async (req, res) => {
  const { id } = req.params; // Extracting event ID from request parameters
  const { event } = req.body; // Extracting updated event data from request body

  // Handling missing event data
  if (!event) {
    return res.status(400).json({ message: 'Event is required' });
  }

  // Validating event data
  if (
    !event.title?.trim() ||
    !event.description?.trim() ||
    !event.date?.trim() ||
    !event.time?.trim() ||
    !event.image?.trim() ||
    !event.location?.trim()
  ) {
    return res.status(400).json({ message: 'Invalid data provided.' });
  }

  // Reading existing events data from file
  const eventsFileContent = await fs.readFile('./data/events.json');
  const events = JSON.parse(eventsFileContent); // Parsing events JSON data

  // Finding the index of the event to be updated
  const eventIndex = events.findIndex((event) => event.id === id);

  // Handling event not found
  if (eventIndex === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }

  // Updating the event with the provided data
  events[eventIndex] = {
    id,
    ...event,
  };

  // Writing updated events data back to file
  await fs.writeFile('./data/events.json', JSON.stringify(events));

  // Delaying response for demonstration purposes
  setTimeout(() => {
    res.json({ event: events[eventIndex] });
  }, 1000);
});

// Endpoint to delete an existing event
app.delete('/events/:id', async (req, res) => {
  const { id } = req.params; // Extracting event ID from request parameters

  // Reading existing events data from file
  const eventsFileContent = await fs.readFile('./data/events.json');
  const events = JSON.parse(eventsFileContent); // Parsing events JSON data

  // Finding the index of the event to be deleted
  const eventIndex = events.findIndex((event) => event.id === id);

  // Handling event not found
  if (eventIndex === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }

  // Removing the event from the events array
  events.splice(eventIndex, 1);

  // Writing updated events data back to file
  await fs.writeFile('./data/events.json', JSON.stringify(events));

  // Delaying response for demonstration purposes
  setTimeout(() => {
    res.json({ message: 'Event deleted' });
  }, 1000);
});

// Starting the server on port 3000

app.listen(3000, () => {
  console.log('Server running on port 3000');
});