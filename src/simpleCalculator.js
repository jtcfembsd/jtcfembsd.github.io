import React, { useState } from 'react';

const SimpleCalculator = () => {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [operation, setOperation] = useState('add');
  const [result, setResult] = useState(null);

  const handleNum1Change = (e) => {
    setNum1(e.target.value);
  };

  const handleNum2Change = (e) => {
    setNum2(e.target.value);
  };

  const handleOperationChange = (e) => {
    setOperation(e.target.value);
  };

  const handleCalculate = () => {
    const number1 = parseFloat(num1);
    const number2 = parseFloat(num2);
    if (isNaN(number1) || isNaN(number2)) {
      alert('Please enter valid numbers');
      return;
    }
    let res;
    if (operation === 'add') {
      res = number1 + number2;
    } else {
      res = number1 * number2;
    }
    setResult(res);
  };

  return (
    <div>
      <h2>Calculator</h2>
      <div>
        <input
          type="number"
          value={num1}
          onChange={handleNum1Change}
          placeholder="Enter first number"
        />
      </div>
      <div>
        <input
          type="number"
          value={num2}
          onChange={handleNum2Change}
          placeholder="Enter second number"
        />
      </div>
      <div>
        <select value={operation} onChange={handleOperationChange}>
          <option value="add">Add</option>
          <option value="multiply">Multiply</option>
        </select>
      </div>
      <button onClick={handleCalculate}>Calculate</button>
      {result !== null && (
        <div>
          <h3>Result: {result}</h3>
        </div>
      )}
    </div>
  );
};

export default SimpleCalculator;
