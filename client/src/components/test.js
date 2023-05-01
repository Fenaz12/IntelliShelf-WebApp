import React, { useState } from 'react';

import axios from 'axios';


export default function Test(){
  const [item, setName] = useState('');
  const [stock, setAge] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8080/api/data', {item, stock, email})
      .then(response => console.log(response))
      .catch(err => console.log(err));
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" value={item} onChange={e => setName(e.target.value)} />
        </label>
        <br />
        <label>
          stock:
          <input type="text" value={stock} onChange={e => setAge(e.target.value)} />
        </label>
        <label>
          email:
          <input type="text" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <br />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
};