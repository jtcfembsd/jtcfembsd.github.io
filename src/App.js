import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CDropdownDivider, CForm, CCol, CFormLabel, CFormInput, CButton, CContainer, CNavbar, CNavbarBrand, CNavbarToggler, CCollapse, CNavbarNav, CNavItem, CNavLink, CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem, CFooter
  
 } from '@coreui/react';
//import SimpleCalculator from './simpleCalculator';
import Initiatives from './initiatives';
//import Test from './test';
import { Oval } from 'react-loader-spinner';
import './App.css';
import '@coreui/coreui/dist/css/coreui.min.css';

const OTPVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  //const [verified, setVerified] = useState(false); //disabled user checks
  const [verified, setVerified] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('session');
    if (session) {
      const { verified, expiry, phoneNumber } = JSON.parse(session);
      if (verified && new Date().getTime() < expiry) {
        setVerified(true);
        setPhoneNumber(phoneNumber);
      }
    }
  }, []);

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handlePhoneNumberSubmit = () => {
    setIsLoading(true);
    fetch('http://localhost:5001/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone_number: phoneNumber }),
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        setShowOtpInput(true);
      } else {
        alert('Phone number not authorised. Please contact admin.');
      }
    })
    .catch(error => {
      console.error("Error:", error);
      alert("Failed to send OTP");
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleOtpSubmit = () => {
    setIsLoading(true);
    fetch('http://localhost:5001/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone_number: phoneNumber, otp }),
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.verified) {
        setVerified(true);
        const expiry = new Date().getTime() + 24 * 60 * 60 * 1000; // 1 day in milliseconds
        localStorage.setItem('session', JSON.stringify({ verified: true, expiry, phoneNumber }));
      } else {
        alert('Invalid OTP');
      }
    })
    .catch(error => {
      console.error("Error:", error);
      alert("Failed to verify OTP");
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('session');
    setVerified(false);
    setPhoneNumber('');
    setShowOtpInput(false);
    setOtp(''); // Add this line to reset the OTP state
  };

  return (
    <Router>
      <div>
        <CNavbar expand="lg" className="bg-body-tertiary">
          <CContainer fluid>
            <CNavbarBrand href="#">JTC-FEM</CNavbarBrand>
            <CNavbarToggler
              aria-label="Toggle navigation"
              aria-expanded={visible}
              onClick={() => setVisible(!visible)}
            />
            <CCollapse className="navbar-collapse" visible={visible}>
              <CNavbarNav>
                <CNavItem>
                  <CNavLink href="/" active>
                    Home
                  </CNavLink>
                </CNavItem>
                <CDropdown variant="nav-item" popper={false}>
                  <CDropdownToggle>Sustainability</CDropdownToggle>
                  <CDropdownMenu>
                    <CDropdownItem href="/initiatives">Action Plan</CDropdownItem>
                    <CDropdownItem href="#">Recycling Data</CDropdownItem>
                    <CDropdownDivider />
                    <CDropdownItem href="#">Healthcheck</CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
              </CNavbarNav>
              {verified && phoneNumber && (
                <CDropdown variant="nav-item" className="ms-auto">
                  <CDropdownToggle caret={false}>{`HELLO, ${phoneNumber}`}</CDropdownToggle>
                  <CDropdownMenu>
                    <CDropdownItem onClick={handleLogout}>Logout</CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
              )}
            </CCollapse>
          </CContainer>
        </CNavbar>

        <div className={verified ? "" : "center-form"}>
        {!verified ? (
        <div>
          {showOtpInput ? (
            <CForm className="row g-3">
            <CCol xs="auto">
            <CFormLabel htmlFor="otp" className="visually-hidden">
              OTP
            </CFormLabel>
            <CFormInput
              type="text"
              id="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={handleOtpChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleOtpSubmit(e);
                }
              }}
              disabled={isLoading}
            />
            </CCol>
            <CCol xs="auto">
              {isLoading && <Oval height={50} width={50} color="blue" ariaLabel="loading" />}
            </CCol>
            <CCol xs="auto">
              <CButton color="primary" onClick={handleOtpSubmit} className="mb-3" disabled={isLoading}>
                Verify OTP
              </CButton>
            </CCol>
            <CCol xs="auto">
              <CButton color="secondary" onClick={handlePhoneNumberSubmit} className="mb-3" disabled={isLoading}>
                Resend OTP
              </CButton>
            </CCol>
            </CForm>
          
          ) : (
          
          <CForm className="row g-3">
          <CCol xs="auto">
            <CFormLabel htmlFor="phoneNumber" className="visually-hidden">
              Phone Number
            </CFormLabel>
            <CFormInput
              type="text"
              id="phoneNumber"
              placeholder="Enter Phone Number"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePhoneNumberSubmit(e);
                }
              }}
              disabled={isLoading}
            />
          </CCol>
          <CCol xs="auto">
            {isLoading && <Oval height={50} width={50} color="blue" ariaLabel="loading" />}
          </CCol>
          <CCol xs="auto">
            <CButton color="primary" onClick={handlePhoneNumberSubmit} className="mb-3" disabled={isLoading}>
              Submit
            </CButton>
          </CCol>
          <div className="otp-image-container">
            <img src="/otp_link.png" alt="OTP Reception" className="otp-image" />
          </div>
          </CForm>
        )}
        </div>
      
      ) : (
  
        <div>
  <Routes>
    <Route path="/" element={
      <div className="App">
        <div className="content-container">
          <h2 className="header-center">Welcome</h2>
          <p>Navigate through the app (above) to explore the following features:</p>
          <ul>
            <li>
              <strong>Action Plan Form</strong><br></br>
              Submit your building sustainability action plans.<br></br>
            </li>
            <li>
              <strong>Recycling Data Form</strong><br></br>
              🚧 Work in progress
            </li>
          </ul>
        </div>
        <CFooter>
          <div>
          </div>
          <div>
            <span>&copy; Service Provided By BSD</span>
          </div>
          <div>
          </div>
      </CFooter>
      </div>
    } />
    <Route path="/initiatives" element={<Initiatives />} />
  </Routes>
</div>

      
)}

    </div>
    </div>
    </Router>
  );
};

export default OTPVerification;
