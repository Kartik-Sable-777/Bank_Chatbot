import { useState } from "react";

function SignupForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    occupation: "",
    contact: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = () => {
    console.log("User Data:", form);
    alert("Account Created! Visit branch for KYC verification.");
  };

  return (
    <>
      <input
        name="firstName"
        placeholder="First Name"
        onChange={handleChange}
      />

      <input
        name="lastName"
        placeholder="Last Name"
        onChange={handleChange}
      />

      <input
        name="age"
        type="number"
        placeholder="Age"
        onChange={handleChange}
      />

      <input
        name="occupation"
        placeholder="Occupation"
        onChange={handleChange}
      />

      <input
        name="contact"
        placeholder="Email or Mobile"
        onChange={handleChange}
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      />

      <input type="file" />

      <button onClick={handleSignup}>Create Account</button>
    </>
  );
}

export default SignupForm;