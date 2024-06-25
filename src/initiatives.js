import React, { useState, useEffect } from 'react';
import { CFormSelect, CFormLabel, CForm, CFormInput, CButton, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CNav, CNavItem, CNavLink, CFooter } from '@coreui/react';
import Select from 'react-select';
import Papa from 'papaparse';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const allOptions = [{ label: 'Select an option', value: '', disabled: true }];

const Initiatives = () => {
  const [sections, setSections] = useState([
    { id: 'FY24', isOpen: true, rows: [] },
    { id: 'FY25', isOpen: false, rows: [] },
    { id: 'FY26', isOpen: false, rows: [] },
    { id: 'FY27', isOpen: false, rows: [] },
    { id: 'FY28', isOpen: false, rows: [] },
    { id: 'FY29', isOpen: false, rows: [] },
    { id: 'FY30', isOpen: false, rows: [] },
  ]);

const [activeSection, setActiveSection] = useState('FY24');
const [selectedLocation, setSelectedLocation] = useState(null);
const [categoryOptions, setCategoryOptions] = useState([]);
const [initiativeOptions, setInitiativeOptions] = useState({});
const [locations, setLocations] = useState([]);
const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/category-initiative.csv') // Update this path to the correct CSV file path
      .then(response => response.text())
      .then(csvText => {
        const parsedData = Papa.parse(csvText, { header: true }).data;
        const categoriesSet = new Set();
        const initiativesMap = {};

        parsedData.forEach(row => {
          const category = row.category;
          const initiative = row.initiative;
          categoriesSet.add(category);
          if (!initiativesMap[category]) {
            initiativesMap[category] = [];
          }
          initiativesMap[category].push({ label: initiative, value: initiative });
        });

        setCategoryOptions(Array.from(categoriesSet).map(category => ({ label: category, value: category })));
        setInitiativeOptions(initiativesMap);
      });

      // Fetch and parse the building-name.csv file
      fetch('/building-name.csv')
      .then(response => response.text())
      .then(csvText => {
        const parsedData = Papa.parse(csvText, { header: true }).data;
        const locationsList = parsedData.map(row => ({
          value: row['Building Name'],
          label: row['Building Name']
        }));
        setLocations(locationsList);
      });
    
    }, []);

  const handleLocationChange = (selectedOption) => {
    setSelectedLocation(selectedOption);
  };

  const toggleSection = (id) => {
    setSections(
      sections.map(section =>
        section.id === id ? { ...section, isOpen: !section.isOpen } : section
      )
    );
  };

  const addRow = (sectionId, isFreeText = false) => {
    setSections(
      sections.map(section =>
        section.id === sectionId
          ? { ...section, rows: [...section.rows, { id: Date.now(), isFreeText, value: '', category: '' }] }
          : section
      )
    );
  };

  const removeRow = (sectionId, rowId) => {
    setSections(
      sections.map(section =>
        section.id === sectionId
          ? { ...section, rows: section.rows.filter(row => row.id !== rowId) }
          : section
      )
    );
  };

  const updateRow = (sectionId, rowId, key, value) => {
    setSections(
      sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              rows: section.rows.map(row =>
                row.id === rowId ? { ...row, [key]: value } : row
              )
            }
          : section
      )
    );
  };

  const generateFlattenedJSON = (sections, location) => {
    const fiscalYears = {};
  
    sections.forEach(section => {
      const initiativesByCategory = {};
  
      section.rows.forEach(row => {
        if (!initiativesByCategory[row.category]) {
          initiativesByCategory[row.category] = [];
        }
        initiativesByCategory[row.category].push(row.value);
      });
  
      const formattedInitiatives = Object.entries(initiativesByCategory)
        .map(([category, initiatives]) => `${category}: ${initiatives.join(', ')}`)
        .join(' | ');
  
      fiscalYears[section.id] = formattedInitiatives;
    });
  
    return {
      location: location.label,
      ...fiscalYears
    };
  };

  // Function to validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const apiEndpoint = process.env.REACT_APP_PLUMBER_APP_API_ENDPOINT;
  
  const handleSubmit = () => {
    // Check if a location is selected
    if (!selectedLocation) {
      alert('Please select a location.');
      return;
    }

    // Check if email is provided and valid
    if (!email) {
      alert('Please enter your email.');
      return;
    }
    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }
  
    // Check each row in each section for valid entries
    for (const section of sections) {
      for (const row of section.rows) {
        if (!row.category || row.category === '' || row.category === 'Select an option') {
          alert('Please select a valid category for all rows.');
          return;
        }
        if (!row.isFreeText && (!row.value || row.value === '' || row.value === 'Select an option')) {
          alert('Please select a valid initiative for all rows.');
          return;
        }
        if (row.isFreeText && (!row.value || row.value === '')) {
          alert('Please fill in the initiative text for all rows.');
          return;
        }
      }
    }
  
    const jsonData = generateFlattenedJSON(sections, selectedLocation);
    const singaporeTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" });
    const singaporeDate = new Date(singaporeTime);
    const formattedDate = `${String(singaporeDate.getDate()).padStart(2, '0')}/${String(singaporeDate.getMonth() + 1).padStart(2, '0')}/${singaporeDate.getFullYear()} ${String(singaporeDate.getHours() % 12 || 12).padStart(2, '0')}:${String(singaporeDate.getMinutes()).padStart(2, '0')} ${singaporeDate.getHours() >= 12 ? 'PM' : 'AM'}`;
  
    // Add the formatted datetime and email to the JSON object
    jsonData.submitted_at = formattedDate;
    jsonData.email = email;
  
    fetch(`${apiEndpoint}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData) // Convert the JSON object to a JSON string
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.text(); // Handle the response as text
    })
    .then(data => {
      console.log('Response from server:', data);
      // Handle the response from the server
      if (data.trim() === "OK") { // Trim any surrounding whitespace
        toast.success('😊 Submission successful!', {
          position: "top-center",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light"
        });

        // Reset form state
      setSelectedLocation(null);
      setEmail('');
      setSections([
        { id: 'FY24', isOpen: true, rows: [] },
        { id: 'FY25', isOpen: false, rows: [] },
        { id: 'FY26', isOpen: false, rows: [] },
        { id: 'FY27', isOpen: false, rows: [] },
        { id: 'FY28', isOpen: false, rows: [] },
        { id: 'FY29', isOpen: false, rows: [] },
        { id: 'FY30', isOpen: false, rows: [] },
      ]);
        console.log('Submission successful!');
      } else {
        console.log('Unexpected response:', data);
        toast.error('Unexpected response from server.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      toast.error('Submission failed. Please try again.');
    });
  };
  

  return (
    <div className="App">
      <h1 className="header-center">Sustainability Action Plan</h1>
      <CForm>
        <CRow className="mb-3">
          <CCol xs="12">
            <CFormLabel htmlFor="selectLocation" className="text-start label-bold">Location</CFormLabel>
            <div className="select-container">
              <Select
                id="selectLocation"
                options={locations}
                value={selectedLocation}
                onChange={handleLocationChange}
                placeholder="Select a location..."
                isSearchable
              />
            </div>
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol xs="12">
            <CFormLabel htmlFor="email" className="text-start label-bold">Email</CFormLabel>
            <CFormInput
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </CCol>
        </CRow>
      </CForm>
      <CNav variant="underline" className="mb-4">
        {sections.map(section => (
          <CNavItem key={section.id}>
            <CNavLink
              href="#"
              active={activeSection === section.id}
              onClick={() => setActiveSection(section.id)}
            >
              {section.id}
            </CNavLink>
          </CNavItem>
        ))}
       </CNav>
       {sections.map(section => (
         section.id === activeSection && (
           <div key={section.id} className="collapsible-section">
             <div className="section-header" onClick={() => toggleSection(section.id)}>
               {section.id}
             </div>
             {section.isOpen && (
               <div className="section-content">
                 <CTable>
                   <CTableHead>
                     <CTableRow>
                       <CTableHeaderCell scope="col">#</CTableHeaderCell>
                       <CTableHeaderCell scope="col">Category</CTableHeaderCell>
                       <CTableHeaderCell scope="col">Initiatives</CTableHeaderCell>
                       <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                     </CTableRow>
                   </CTableHead>
                   <CTableBody>
                     {section.rows.map((row, index) => (
                       <CTableRow key={row.id}>
                         <CTableHeaderCell scope="row" className="table-cell">{index + 1}</CTableHeaderCell>
                         <CTableDataCell className="table-cell">
                           <CFormSelect
                             aria-label="Select Category"
                             value={row.category}
                             onChange={(e) => updateRow(section.id, row.id, 'category', e.target.value)}
                             className="table-input category-select"
                           >
                             {allOptions.concat(categoryOptions).map((option, idx) => (
                               <option key={idx} value={option.value}>
                                 {option.label}
                               </option>
                             ))}
                           </CFormSelect>
                         </CTableDataCell>
                         <CTableDataCell className="table-cell">
                           {row.category && !row.isFreeText && (
                             <CFormSelect
                               aria-label="Select Initiatives"
                               value={row.value}
                               onChange={(e) => updateRow(section.id, row.id, 'value', e.target.value)}
                               className="table-input"
                             >
                               {allOptions.concat(initiativeOptions[row.category] || []).map((option, idx) => (
                                 <option key={idx} value={option.value}>
                                   {option.label}
                                 </option>
                               ))}
                             </CFormSelect>
                           )}
                           {row.isFreeText && (
                             <CFormInput
                               type="text"
                               id="exampleFormControlInput1"
                               placeholder="Add Initiatives (Others)"
                               aria-describedby="exampleFormControlInputHelpInline"
                               value={row.value}
                               onChange={(e) => updateRow(section.id, row.id, 'value', e.target.value)}
                               className="table-input"
                             />
                           )}
                         </CTableDataCell>
                         <CTableDataCell className="table-cell">
                           <CButton color="danger" onClick={() => removeRow(section.id, row.id)}>Delete</CButton>
                         </CTableDataCell>
                       </CTableRow>
                     ))}
                   </CTableBody>
                 </CTable>
                 <CButton color="primary" className="button-spacing" onClick={() => addRow(section.id)}>Add Row</CButton>
                 <CButton color="secondary" onClick={() => addRow(section.id, true)}>Add Others (Freetext)</CButton>
               </div>
             )}
           </div>
         )
       ))}
       <br />
       <div className="form-section">
         <CButton color="success" onClick={handleSubmit}>Submit Form</CButton>
       </div>
       <br></br><br></br>
       <CFooter>
          <div>
          </div>
          <div>
            <span>&copy; Service Provided By BSD</span>
          </div>
          <div>
          </div>
      </CFooter>
       <ToastContainer />
     </div>
   );
 };

 export default Initiatives;
