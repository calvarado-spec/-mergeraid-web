export default function handler(req, res) {
  if (req.method === 'POST') {
    const userResponse = req.body;
    console.log('Received response:', userResponse); // This will log to your terminal
    res.status(200).json({ message: 'Response received successfully!' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}