const mysql = require('mysql2/promise');
require('dotenv').config();
const path = require('path');

async function classifyGrants() {
  // Connect to the MySQL database

  const connection = await mysql.createConnection({
    host:  process.env.host,
    user:  process.env.user,
    password:  process.env.password,
    database:  process.env.database
  });
  
  const [rows] = await connection.execute('SELECT id, title, EstimatedTotalProgramFunding FROM grants_trackings');

  // Define the categories and their corresponding keywords
  const categories = {
    'Cyber': ['cyber', 'cybersecurity', 'cybercrime', 'cyberattack'],
    'CyberSecurity': ['cyber security', 'cybersecurity'],
    'Policing': ['police', 'policing'],
    'Criminal Justice': ['criminal justice'],
    'Criminology': ['criminology', 'criminal'],
    'Healthcare': ['health', 'medical', 'hospital', 'patient', 'disease', 'treatment'],
    'Sentencing': ['sentence', 'sentencing'],
    'Rehabilitation': ['rehabilitation', 'rehab'],
    'PhD': ['phd', 'doctoral', 'doctorate'],
    'Public Safety': ['public safety']
  };

  // Create the classified_grants table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS classified_grants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category VARCHAR(255),
      grant_id INT,
      estimated_total_program_funding DECIMAL(10,2)
    )
  `);

  // Classify grants and insert them into the classified_grants table
  for (const { id, title, EstimatedTotalProgramFunding } of rows) {
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => title.toLowerCase().includes(keyword))) {
        await connection.execute('INSERT INTO classified_grants (category, grant_id, estimated_total_program_funding) VALUES (?, ?, ?)', [category, id, EstimatedTotalProgramFunding]);
      }
    }
  }

  // Close the database connection
  await connection.end();
}

classifyGrants();