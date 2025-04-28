import express from "express";
import dotenv from "dotenv";
// import { GoogleGenAI } from "@google/genai";
import cors from 'cors';
import Joi from "joi";
import axios from "axios";
dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

// Initialize  Gemeni
// const ai = new GoogleGenAI({ apiKey: process.env.GEMENI_API_KEY });

// Middleware to parse JSON bodies (required for POST requests)
app.use(express.json());
app.use(cors({
  origin: '*', 
}));

// _____( validate the prompt method)______

const promptSchema = Joi.object({
  prompt: Joi.string()
    .pattern(/^[a-zA-Z\s,'-]+$/)  // only letters, spaces, commas, apostrophes, hyphens
    .min(2)  // Minimum of 2 characters
    .max(15)  // Maximum of 15 characters
    .required()
    .messages({
      "string.pattern.base": "Prompt must only contain letters, spaces, commas, apostrophes, or hyphens.",
      "string.empty": "Prompt is required.",
      "string.min": "Prompt should be at least 2 characters.",
      "string.max": "Prompt should not exceed 15 characters.",
    })
});


app.get("/", (req,res) => {
  res.send("API is working");
})



// Generate MCQs route

 

app.post("/generate-mcqs", async (req, res) => {
  const { error } = promptSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      text: error.details[0].message,
    });
  }

  const { prompt } = req.body;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        contents: [{
          parts: [{ text: `Write top fifteen MCQs on ${prompt} with answers. Each MCQ ends with a "#" sign.` }]
        }]
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          key: process.env.GEMENI_API_KEY, // your Gemini API Key
        },
      }
    );

    const result = response.data.candidates[0].content.parts[0].text;

    return res.status(200).json({
      success: true,
      text: result
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ error: "Something went wrong!" });
  }
});



// app.post("/generate-mcqs", async (req, res) => {
//   const { error } = promptSchema.validate(req.body);

//   if (error) {
//     return res.status(400).json({
//       success: false,
//       text: error.details[0].message,
//     });
//   }
//   const {prompt} = req.body;

//   try {

//     const response = await ai.models.generateContent({
//         model: "gemini-2.0-flash",
//         contents: `Write a top fifteen most important  MCQS of given topic : ${prompt} with answer and also keep  "#" sign at the end of each mcqs and don't write even this "Okay, here are ten important MCQs about the Sun, written in a simple style and easy to separate", just start it from 1,2 etc. `,
//       });
//           const result = response.text;

          
//     return res.status(200).json({
//         success:true,
//         text: result
//      })
//   } catch (error) {
//     console.error(error);
//    return  res.status(500).json({ error: "Something went wrong!" });
    
//   }
// });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on localhost:${port}`);
});
