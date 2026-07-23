# 🏥 CareAI – AI Healthcare Assistant

CareAI is an AI-powered healthcare web application designed to help users manage their health through an intelligent virtual assistant, health management tools, and emergency support. It combines Artificial Intelligence, Machine Learning, and modern web technologies to provide a user-friendly healthcare experience.

> **Disclaimer:** CareAI provides general health information only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns. In a medical emergency, contact your local emergency services immediately.

---

## ✨ Features

### 🤖 AI Healthcare Assistant
- AI chatbot for general health-related questions
- Symptom explanations
- Medicine information
- Lifestyle recommendations
- Nutrition guidance
- Mental wellness suggestions
- Health education

### 👤 User Authentication
- Secure Login
- User Registration
- JWT Authentication

### 👤 User Profile
- Full Name
- Age
- Gender
- Email
- Contact Number
- Blood Group
- Height & Weight
- Medical History
- Allergies
- Current Medications
- Emergency Contact

### ❤️ Disease Prediction
- Heart Disease Risk
- Diabetes Prediction
- BMI Calculator
- Symptom Checker

### 🚨 Emergency SOS
- One-click SOS button
- Emergency caregiver contacts
- Doctor contact management

### 💊 Medicine Management
- Medicine reminders
- Dosage tracking
- Daily schedule

### 📅 Appointment Manager
- Add appointments
- Track upcoming visits
- Doctor information

### 📍 Nearby Services
- Nearby Hospitals
- Nearby Medical Stores
- Google Maps integration

### 📊 Health Dashboard
- Personal health overview
- Recent activities
- AI chat history

---

# 🛠 Tech Stack

## Frontend
- React.js
- JavaScript
- Tailwind CSS
- React Router
- Axios

## Backend
- FastAPI
- Python

## Database
- MongoDB

## Authentication
- JWT

## AI
- Claude AI / LLM Integration

## Machine Learning
- Scikit-learn
- Pandas
- NumPy

---

# 📁 Project Structure

```
CareAI/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── assets/
│   └── App.jsx
│
├── server.py
├── requirements.txt
├── package.json
├── .env.example
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/taashusrivastava/health.careAI.git
cd health.careAI
```

## Install Frontend

```bash
npm install
```

## Install Backend

```bash
pip install -r requirements.txt
```

## Configure Environment Variables

Create a `.env` file using `.env.example`.

Example:

```env
MONGO_URL=your_mongodb_url
DB_NAME=careai
JWT_SECRET=your_secret_key
EMERGENT_LLM_KEY=your_api_key
```

---

# ▶️ Run the Project

### Backend

```bash
python server.py
```

or

```bash
uvicorn server:app --reload
```

### Frontend

```bash
npm start
```

or

```bash
npm run dev
```

---

# 🚀 Future Enhancements

- Voice-based AI assistant
- Wearable device integration
- Medical report analyzer
- AI-powered prescription reader
- Telemedicine support
- Doctor appointment booking
- Health analytics dashboard
- Multi-language support
- Family member profiles
- Push notifications

---

# 🔒 Security

- JWT Authentication
- Password Hashing with bcrypt
- Secure API endpoints
- MongoDB integration
- Environment variable protection

---

# 📸 Screenshots

Add screenshots of:

- Login Page
- Dashboard
- AI Assistant
- User Profile
- Disease Prediction
- SOS Feature
- Nearby Hospitals
- Medicine Reminder

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push the branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👩‍💻 Developer

**Taashu Srivastava**

- GitHub: https://github.com/taashusrivastava
- LinkedIn: *(Add your LinkedIn profile)*
- Email: *(Add your email address)*

---

⭐ If you found this project useful, consider giving it a star on GitHub!
