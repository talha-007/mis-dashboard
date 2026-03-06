import { Helmet } from 'react-helmet-async';

import { EmployeeView } from 'src/sections/Bankadmin/employee/employee-view';

export default function EmployeesPage() {
  return (
    <>
      <Helmet>
        <title> Employees | MIS Dashboard </title>
      </Helmet>
      <EmployeeView />
    </>
  );
}

