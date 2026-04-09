import { Helmet } from 'react-helmet-async';

import { EmployeeFormView } from 'src/sections/Bankadmin/employee/employee-form-view';

export default function EmployeeAddPage() {
  return (
    <>
      <Helmet>
        <title>Add employee | MIS Dashboard</title>
      </Helmet>
      <EmployeeFormView />
    </>
  );
}
