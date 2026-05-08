const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get('/', (req, res) => {
  res.send('API is running');
});

// CHECK-IN ROUTE// CHECK-IN ROUTE
app.post('/api/checkin', async (req, res) => {
  const { userType, identityNumber, fullName, campus, service } = req.body;

  try {
    // 1. Check if user exists based on User Type
    let userQuery = '';
    if (userType === 'student') {
      userQuery = 'SELECT * FROM users WHERE student_number = $1';
    } else if (userType === 'staff') {
      userQuery = 'SELECT * FROM users WHERE staff_number = $1';
    } else {
      userQuery = 'SELECT * FROM users WHERE id_number = $1 AND role = \'visitor\'';
    }

    let userResult = await pool.query(userQuery, [identityNumber]);
    let user;

    // If user doesn't exist, create them
    if (userResult.rows.length === 0) {
      const [firstName, ...rest] = fullName.split(' ');
      const lastName = rest.join(' ');

      // Assign the correct columns based on user type
      let studentNo = userType === 'student' ? identityNumber : null;
      let staffNo = userType === 'staff' ? identityNumber : null;
      let idNo = identityNumber; // Because id_number is NOT NULL in your DB

      const newUser = await pool.query(
        `INSERT INTO users (role, student_number, staff_number, id_number, first_name, last_name)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,[userType, studentNo, staffNo, idNo, firstName, lastName]
      );

      user = newUser.rows[0];
    } else {
      user = userResult.rows[0];
    }

    // 2. Get service ID
    const serviceMap = {
      emergency: 'Medical Emergency',
      hiv: 'HIV Testing',
      family: 'Family Planning',
      general: 'General Walk-in'
    };

    const serviceName = serviceMap[service];
    const serviceResult = await pool.query(
      'SELECT service_id FROM services WHERE name = $1', [serviceName]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Service not found' });
    }
    const service_id = serviceResult.rows[0].service_id;

    // 3. Get clinic ID
    const clinicResult = await pool.query(
      'SELECT clinic_id FROM clinics WHERE campus = $1', [campus]
    );
    if (clinicResult.rows.length === 0) {
      return res.status(400).json({ error: 'Clinic not found' });
    }
    const clinic_id = clinicResult.rows[0].clinic_id;

    // 4. Generate queue number
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM checkins 
       WHERE clinic_id = $1 AND service_id = $2 AND status = 'waiting'`, [clinic_id, service_id]
    );

    const count = parseInt(countResult.rows[0].count) + 1;
    const queueNumber = service === 'emergency' ? `E-${count}` : `Q-${count}`;

    // 5. Insert check-in
    const result = await pool.query(
      `INSERT INTO checkins (user_id, clinic_id, service_id, status, queue_number)
       VALUES ($1, $2, $3, 'waiting', $4)
       RETURNING *`,[user.user_id, clinic_id, service_id, queueNumber]
    );

    res.json({ queueNumber });

  } catch (err) {
    if (err.code === '23505') { // Postgres Unique Constraint Violation
      return res.status(400).json({ error: 'You already have an active check-in' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });

  }

  
});

//Login route 
app.post('/api/login',async(req,res)=>{
  const{studentNum,password} = req.body;

  try{
    //Student/Staff No search in db
    const userResult = await pool.query(
      'SELECT * FROM users WHERE student_number = $1 OR staff_number = $1',[studentNum]
      
    );

    //User not found
    if(userResult.rows.length==0){
      return res.status(404).json({error: 'Inavlid Student/Staff No or Password'});
    }
    const user = userResult.rows[0];

    //Validate Password
    if(user.password!=password){
      return res.status(401).json({error: 'Invalid Student/Staff.No or Password'});
    }

    //return user data
    res.json({
      user: {
        firstName: user.first_name,
        lastName: user.last_name,
        studentNumber: user.student_number,
        staffNumber: user.staff_number,
        role: user.role
      }
    });

  }catch(err){
    console.error(err);
    res.status(500).json({erro: 'Server error during login'});
  }
});

// --- STAFF ROUTES ---

// 1. Get Walk-in Queue for a specific campus
app.get('/api/staff/walkins', async (req, res) => {
  const { campus } = req.query;

  try {
    const queueQuery = `
      SELECT 
        c.checkin_id, 
        c.queue_number, 
        c.status, 
        c.checked_in_at,
        u.first_name, 
        u.last_name, 
        u.role as user_type,
        COALESCE(u.student_number, u.staff_number, u.id_number) as identifier,
        s.name as service_name
      FROM checkins c
      JOIN users u ON c.user_id = u.user_id
      JOIN services s ON c.service_id = s.service_id
      JOIN clinics cl ON c.clinic_id = cl.clinic_id
      WHERE cl.campus = $1 
        AND c.status IN ('waiting', 'in_progress')
      ORDER BY 
        -- Emergencies (E-) go first, then normal (Q-)
        CASE WHEN c.queue_number LIKE 'E-%' THEN 1 ELSE 2 END,
        c.checkin_id ASC
    `;

    const result = await pool.query(queueQuery, [campus]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

// 2. Update Check-in Status (e.g., waiting -> in-progress -> completed)
app.put('/api/staff/walkins/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'in-progress', 'completed', 'no-show'

  try {
    const result = await pool.query(
      `UPDATE checkins SET status = $1 WHERE checkin_id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Check-in not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

app.listen(5000, () => {
console.log('Server running on http://localhost:5000');
});