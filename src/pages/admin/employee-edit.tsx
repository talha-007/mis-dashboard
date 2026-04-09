import { Helmet } from 'react-helmet-async';

import { EmployeeFormView } from 'src/sections/Bankadmin/employee/employee-form-view';

export default function EmployeeEditPage() {
  return (
    <>
      <Helmet>
        <title>Edit employee | MIS Dashboard</title>
      </Helmet>
      <EmployeeFormView />
    </>
  );
}
