const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

const patients = [
  { id: 1, name: 'Ramesh Kumar', age: 52, condition: 'Hypertension', ward: 'Cardiology', status: 'Admitted' },
  { id: 2, name: 'Priya Sharma', age: 34, condition: 'Gestational Diabetes', ward: 'Maternity', status: 'Observation' },
  { id: 3, name: 'Arjun Patel', age: 67, condition: 'Knee Replacement', ward: 'Orthopaedics', status: 'Recovery' }
];

app.get('/health', (req, res) => res.status(200).json({
  status: 'healthy', service: 'MediTrack HMS',
  version: process.env.APP_VERSION || 'v1.0.0', timestamp: new Date().toISOString()
}));

app.get('/api/patients', (req, res) => res.json({ success: true, count: patients.length, data: patients }));

app.get('/api/patients/:id', (req, res) => {
  const patient = patients.find(p => p.id === parseInt(req.params.id));
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  res.json({ success: true, data: patient });
});

app.post('/api/patients', (req, res) => {
  const { name, age, condition, ward } = req.body;
  if (!name || !age || !condition) return res.status(400).json({ success: false, message: 'Missing fields' });
  const patient = { id: patients.length + 1, name, age, condition, ward: ward || 'General', status: 'Admitted' };
  patients.push(patient);
  res.status(201).json({ success: true, data: patient });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MediTrack running on port ${PORT}`));
