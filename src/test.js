import React from 'react';
import { CFormLabel, CFormInput, CRow, CCol } from '@coreui/react';

const Test = () => {
  return (
    <div className="App">
      <h1>Test Form</h1>
      <CRow className="mb-3">
        <CFormLabel htmlFor="colFormLabelSm" className="col-sm-2 col-form-label col-form-label-sm">Email (Small)</CFormLabel>
        <CCol sm={10}>
          <CFormInput type="email" className="form-control form-control-sm" id="colFormLabelSm" placeholder="col-form-label-sm" />
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CFormLabel htmlFor="colFormLabel" className="col-sm-2 col-form-label">Email (Default)</CFormLabel>
        <CCol sm={10}>
          <CFormInput type="email" id="colFormLabel" placeholder="col-form-label" />
        </CCol>
      </CRow>
      <CRow>
        <CFormLabel htmlFor="colFormLabelLg" className="col-sm-2 col-form-label col-form-label-lg">Email (Large)</CFormLabel>
        <CCol sm={10}>
          <CFormInput type="email" className="form-control form-control-lg" id="colFormLabelLg" placeholder="col-form-label-lg" />
        </CCol>
      </CRow>
    </div>
  );
};

export default Test;
