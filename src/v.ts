
// imports
import baseCtrl             = require("ctrl");
import moduleBaseController = require("shared/ctrl/moduleBaseCtrl");
import formVm               = require("components/form/vm");
import SampleTestService    = require("components/acbrowse/service/SampleTestService");
import browseServiceFile    = require("components/browse/browse/services/$browse");
import commonViewModels     = require("components/browse/browse/vm/vm");
import identityServiceFile  = require("shared/services/$identity");   // added for userName
import config               = require("config");                       // added for report URL
import requestData          = require("components/browse/requestData"); // added for report params

"use strict";

// export name of controller
export var name: string = "SampleTestCtrl";

// interface ISampleTestCtrlScope
export interface ISampleTestCtrlScope
  extends moduleBaseController.IModuleBaseCtrlScope {

  // variables
  $obj2: TemplatePropertiesForBrowse;
  $obj1: TemplatePropertiesForUpdate;

  // api methods
  display(): void;
  getById(): void;
  saveEmpDetail(): void;
  updateEmpDetail(): void;
  deleteById(): void;
  displayWithDept(): void;
  getByEmpId(): void;
  getByDeptId(): void;
  getByDateRange(): void;
  saveDeptDetail(): void;
  saveEmpWithDate(): void;

  // browse methods
  addConfig(): void;
  updateConfig(selectedRow: any): void;
  deleteConfig(selectedRow: any): void;

  // form methods
  acupdate2(): void;
  acupdate3(): void;
  acupdate4(): void;
  acDelete(): void;
  acGetByEmp(): void;
  acGetByDept(): void;
  acDateFilter(): void;
  acAddDept(): void;
  acAddEmp(): void;
}

// class TemplatePropertiesForBrowse
class TemplatePropertiesForBrowse {
  browsePropForEmpData: commonViewModels.BrowseInput;
  loadBrowse: boolean;
}

// class TemplatePropertiesForUpdate
class TemplatePropertiesForUpdate {
  isLoad: boolean;
  formDefForSet: formVm.FormDefinition;
  formRecForSet: formVm.FormRecord;
}

export interface ISampleTestCtrlController
  extends moduleBaseController.IModuleBaseCtrl {}

// controller class SampleTestCtrl
class SampleTestCtrl extends moduleBaseController.ModuleBaseCtrl
  implements ISampleTestCtrlController {

  constructor(
    public $scope:     ISampleTestCtrlScope,
    public $injector:  ng.auto.IInjectorService,
    public $test:      SampleTestService.ISampleTestService,
    private $timeout:  ng.ITimeoutService,
    private $browse:   browseServiceFile.IBrowseService,
    private $identity: identityServiceFile.IIdentityService   // added for report userName
  ) {
    super($scope, $injector);

    // initialize $obj2 (browse)
    $scope.$obj2 = new TemplatePropertiesForBrowse();
    $scope.$obj2.browsePropForEmpData = new commonViewModels.BrowseInput();
    $scope.$obj2.browsePropForEmpData.data = [];
    $scope.$obj2.loadBrowse = false;

    $scope.$obj1 = new TemplatePropertiesForUpdate();

    // ── populateBrowse: employee-only columns ─────────────────────────────────
    var populateBrowse = (): void => {
      var bp: commonViewModels.BrowseInput = new commonViewModels.BrowseInput();
      bp.normalColDefs           = $test.getBrowseColForDef();
      bp.browseMessage.title     = "Employee Details";
      bp.browseMessage.subTitle1 = "subTitle1";
      bp.enableBrowseSearching   = true;
      bp.enableRowSelection      = true;
      bp.enableActions           = true;
      bp.actions                 = $test.getBrowseActionsForEmp($scope);
      bp.enableDbClick           = true;
      bp.enableExport            = true;
      bp.enablePdfExport         = true;
      bp.enableExcelExport       = true;
      bp.enableCSVExport         = true;
      $scope.$obj2.browsePropForEmpData = bp;
      $browse.populateActions($scope, "$obj2.browsePropForEmpData", bp);
      $scope.$obj2.loadBrowse = true;
      bp.data = [];
    };

    // ── populateBrowseWithDept: employee + department columns + Jasper print ──
    var populateBrowseWithDept = (): void => {
      var bp: commonViewModels.BrowseInput = new commonViewModels.BrowseInput();
      bp.normalColDefs           = $test.getBrowseColWithDept();
      bp.browseMessage.title     = "Employee + Department Details";
      bp.browseMessage.subTitle1 = "Joined View";
      bp.enableBrowseSearching   = true;
      bp.enableRowSelection      = true;
      bp.enableActions           = true;
      bp.actions                 = $test.getBrowseActionsForEmp($scope);
      bp.enableDbClick           = true;
      bp.enableExport            = true;
      bp.enablePdfExport         = true;
      bp.enableExcelExport       = true;
      bp.enableCSVExport         = true;

      // ── Jasper Report print configuration ──────────────────────────────────
      // The browse component will POST this requestData to requestUrlForPrint
      // and append exportReport ("1"=Excel, "2"=PDF, "3"=CSV) automatically.
      var reportReqData: requestData.RequestData = new requestData.RequestData();
      reportReqData.params = {
        userName: $identity.currentUser.holdersName
      };
      bp.requestUrlForPrint          = config.Configs.url() + "/doc/exportEmployeeReport";
      bp.requestDataForReportPrint   = reportReqData;
      // ────────────────────────────────────────────────────────────────────────

      $scope.$obj2.browsePropForEmpData = bp;
      $browse.populateActions($scope, "$obj2.browsePropForEmpData", bp);
      $scope.$obj2.loadBrowse = true;
      bp.data = [];
    };

    $timeout((): void => { populateBrowse(); }, 1000);

    // ── display: get all employees ───────────────────────────────────────────
    $scope.display = (): void => {
      $test.getData().then((response: any): void => {
        if (!response.data.isError) {
          populateBrowse();
          $scope.$obj2.browsePropForEmpData.data = response.data.data;
          $scope.$obj2.loadBrowse = true;
        }
      });
    };

    // ── getById: get employee by id ──────────────────────────────────────────
    $scope.getById = (): void => {
      var idVal = $scope.$obj1.formRecForSet.fieldValues.EmpId.value;
      if (!idVal || idVal === 0) {
        alert("Please enter a valid Employee ID.");
        return;
      }
      var id = parseInt(idVal);
      if (isNaN(id) || id <= 0) {
        alert("Employee ID must be a positive number.");
        return;
      }
      $test.getById(id).then((response: any): void => {
        if (response.data.isError || !response.data.data) {
          alert("Employee not found for ID: " + id);
          return;
        }
        populateBrowse();
        $scope.$obj2.browsePropForEmpData.data = [response.data.data];
        $scope.$obj2.loadBrowse = true;
      });
    };

    // ── saveEmpDetail: save employee (simple) ────────────────────────────────
    $scope.saveEmpDetail = (): void => {
      var fv      = $scope.$obj1.formRecForSet.fieldValues;
      var nameVal = fv.name     ? String(fv.name.value     || "").trim() : "";
      var salVal  = fv.salary   ? fv.salary.value   : 0;
      var posVal  = fv.position ? String(fv.position.value || "").trim() : "";
      var deptVal = fv.deptId   ? fv.deptId.value   : 0;

      if (!nameVal)                        { alert("Name is required.");                    return; }
      if (!salVal || Number(salVal) <= 0)  { alert("Salary must be greater than 0.");       return; }
      if (!posVal)                         { alert("Position is required.");                return; }

      var params: any = { name: nameVal, salary: Number(salVal), position: posVal };
      if (deptVal && Number(deptVal) > 0) params.deptId = Number(deptVal);

      $test.saveData({ params: params }).then((response: any): void => {
        if (!response.data || response.data.isError) { alert("Save failed."); return; }
        alert("Employee saved successfully.");
        populateBrowseWithDept();
        $scope.displayWithDept();
      });
    };

    // ── updateEmpDetail: update employee ────────────────────────────────────
    $scope.updateEmpDetail = (): void => {
      var fv      = $scope.$obj1.formRecForSet.fieldValues;
      var idVal   = fv.id          ? fv.id.value          : 0;
      var nameVal = fv.name        ? String(fv.name.value        || "").trim() : "";
      var salVal  = fv.salary      ? fv.salary.value      : 0;
      var posVal  = fv.position    ? String(fv.position.value    || "").trim() : "";
      var deptVal = fv.deptId      ? fv.deptId.value      : 0;
      var creDate = fv.createdDate ? String(fv.createdDate.value || "").trim() : "";
      var dueDate = fv.dueDate     ? String(fv.dueDate.value     || "").trim() : "";

      if (!idVal || Number(idVal) <= 0) { alert("Emp Id is required."); return; }

      var params: any = { id: Number(idVal) };
      if (nameVal)                          params.name        = nameVal;
      if (salVal && Number(salVal) > 0)     params.salary      = Number(salVal);
      if (posVal)                           params.position    = posVal;
      if (deptVal && Number(deptVal) > 0)   params.deptId      = Number(deptVal);
      if (creDate)                          params.createdDate = creDate;
      if (dueDate)                          params.dueDate     = dueDate;

      $test.updateData({ params: params }).then((response: any): void => {
        if (!response.data || response.data.isError) { alert("Update failed."); return; }
        alert("Employee updated successfully.");
        populateBrowseWithDept();
        $scope.displayWithDept();
      });
    };

    // ── deleteById: delete employee ──────────────────────────────────────────
    $scope.deleteById = (): void => {
      var idVal = $scope.$obj1.formRecForSet.fieldValues.EmpId.value;
      if (!idVal || idVal === 0) { alert("Please enter a valid Employee ID to delete."); return; }
      var id = parseInt(idVal);
      if (!confirm("Delete Employee ID: " + id + "?")) return;
      $test.deleteByIdInDB(id).then((response: any): void => {
        if (!response.data || response.data.isError) { alert("Delete failed."); return; }
        alert("Employee deleted successfully.");
        $scope.displayWithDept();
      });
    };

    // ── displayWithDept: get all employees with department ───────────────────
    $scope.displayWithDept = (): void => {
      $test.getAllDataWithDept().then((response: any): void => {
        if (!response.data.isError) {
          populateBrowseWithDept();
          $scope.$obj2.browsePropForEmpData.data = response.data.data;
          $scope.$obj2.loadBrowse = true;
        } else {
          alert("Error fetching data.");
        }
      });
    };

    // ── getByEmpId: get employee with department by empId ────────────────────
    $scope.getByEmpId = (): void => {
      var empIdVal = $scope.$obj1.formRecForSet.fieldValues.empId
        ? $scope.$obj1.formRecForSet.fieldValues.empId.value
        : null;
      if (!empIdVal || empIdVal === 0) { alert("Please enter a valid Employee ID."); return; }
      var empId = parseInt(empIdVal);
      $test.getByEmpId(empId).then((response: any): void => {
        if (response.data.isError || !response.data.data) {
          alert("Employee not found for ID: " + empId);
          return;
        }
        populateBrowseWithDept();
        $scope.$obj2.browsePropForEmpData.data = [response.data.data];
        $scope.$obj2.loadBrowse = true;
      });
    };

    // ── getByDeptId: get all employees by department ─────────────────────────
    $scope.getByDeptId = (): void => {
      var deptIdVal = $scope.$obj1.formRecForSet.fieldValues.deptId
        ? $scope.$obj1.formRecForSet.fieldValues.deptId.value
        : null;
      if (!deptIdVal || deptIdVal === 0) { alert("Please enter a valid Department ID."); return; }
      var deptId = parseInt(deptIdVal);
      $test.getByDeptId(deptId).then((response: any): void => {
        if (response.data.isError) { alert("No employees found for Department ID: " + deptId); return; }
        populateBrowseWithDept();
        $scope.$obj2.browsePropForEmpData.data = response.data.data;
        $scope.$obj2.loadBrowse = true;
      });
    };

    // ── getByDateRange: filter employees by date range ────────────────────────
    $scope.getByDateRange = (): void => {
      var fv       = $scope.$obj1.formRecForSet.fieldValues;
      var fromDate = fv.fromDate ? String(fv.fromDate.value || "").trim() : "";
      var toDate   = fv.toDate   ? String(fv.toDate.value   || "").trim() : "";

      if (!fromDate)            { alert("From Date is required.");                         return; }
      if (!toDate)              { alert("To Date is required.");                           return; }
      if (fromDate > toDate)    { alert("From Date must be on or before To Date.");        return; }

      $test.getByDateRange(fromDate, toDate).then((response: any): void => {
        if (response.data.isError) { alert("No records found for the selected date range."); return; }
        populateBrowseWithDept();
        $scope.$obj2.browsePropForEmpData.data = response.data.data;
        $scope.$obj2.loadBrowse = true;
      });
    };

    // ── saveDeptDetail: save department ──────────────────────────────────────
    $scope.saveDeptDetail = (): void => {
      var fv       = $scope.$obj1.formRecForSet.fieldValues;
      var deptName = fv.deptName ? String(fv.deptName.value || "").trim() : "";
      var location = fv.location ? String(fv.location.value || "").trim() : "";

      if (!deptName) { alert("Department Name is required."); return; }
      if (!location) { alert("Location is required.");        return; }

      $test.saveDepartment({ params: { deptName: deptName, location: location } })
        .then((response: any): void => {
          if (!response.data || response.data.isError) { alert("Department save failed."); return; }
          alert("Department saved successfully.");
          $scope.displayWithDept();
        });
    };

    // ── saveEmpWithDate: save employee with dates ─────────────────────────────
    $scope.saveEmpWithDate = (): void => {
      var fv      = $scope.$obj1.formRecForSet.fieldValues;
      var nameVal = fv.name        ? String(fv.name.value        || "").trim() : "";
      var salVal  = fv.salary      ? fv.salary.value      : 0;
      var posVal  = fv.position    ? String(fv.position.value    || "").trim() : "";
      var deptVal = fv.deptId      ? fv.deptId.value      : 0;
      var creDate = fv.createdDate ? String(fv.createdDate.value || "").trim() : "";
      var dueDate = fv.dueDate     ? String(fv.dueDate.value     || "").trim() : "";

      if (!nameVal)                       { alert("Name is required.");              return; }
      if (!salVal || Number(salVal) <= 0) { alert("Salary must be greater than 0."); return; }
      if (!posVal)                        { alert("Position is required.");           return; }

      var params: any = { name: nameVal, salary: Number(salVal), position: posVal };
      if (deptVal && Number(deptVal) > 0) params.deptId      = Number(deptVal);
      if (creDate)                        params.createdDate  = creDate;
      if (dueDate)                        params.dueDate      = dueDate;

      $test.saveData({ params: params }).then((response: any): void => {
        if (!response.data || response.data.isError) { alert("Employee save failed."); return; }
        alert("Employee saved successfully.");
        populateBrowseWithDept();
        $scope.displayWithDept();
      });
    };

    // ── Browse action button callbacks ────────────────────────────────────────
    $scope.addConfig = (): void => { $scope.acAddEmp(); };

    $scope.updateConfig = (selectedRow: any): void => {
      if (!selectedRow) { alert("Please select a row to edit."); return; }
      $scope.acupdate4();
      $timeout((): void => {
        $scope.$obj1.formRecForSet.fieldValues.id.value = selectedRow.EmpId;
      }, 200);
    };

    $scope.deleteConfig = (selectedRow: any): void => {
      if (!selectedRow) { alert("Please select a row to delete."); return; }
      $scope.acDelete();
      $timeout((): void => {
        $scope.$obj1.formRecForSet.fieldValues.EmpId.value = selectedRow.EmpId;
      }, 200);
    };

    // ── Form loader methods ───────────────────────────────────────────────────
    $scope.acupdate2 = (): void => {
      $scope.$obj1.formDefForSet = new formVm.FormDefinition();
      var f = $test.getFormDef1($scope.$obj1.formDefForSet, $scope.$obj1.formRecForSet);
      $scope.$obj1.formDefForSet = f.formDefinition;
      $scope.$obj1.formRecForSet = f.formRecord;
      $scope.$obj1.isLoad = true;
    };

    $scope.acupdate3 = (): void => {
      $scope.$obj1.formDefForSet = new formVm.FormDefinition();
      var f = $test.getFormDef2($scope.$obj1.formDefForSet, $scope.$obj1.formRecForSet);
      $scope.$obj1.formDefForSet = f.formDefinition;
      $scope.$obj1.formRecForSet = f.formRecord;
      $scope.$obj1.isLoad = true;
    };

    $scope.acupdate4 = (): void => {
      $scope.$obj1.formDefForSet = new formVm.FormDefinition();
      var f = $test.getFormDef3($scope.$obj1.formDefForSet, $scope.$obj1.formRecForSet);
      $scope.$obj1.formDefForSet = f.formDefinition;
      $scope.$obj1.formRecForSet = f.formRecord;
      $scope.$obj1.isLoad = true;
    };

    $scope.acDelete = (): void => {
      $scope.$obj1.formDefForSet = new formVm.FormDefinition();
      var f = $test.getFormDefDel($scope.$obj1.formDefForSet, $scope.$obj1.formRecForSet);
      $scope.$obj1.formDefForSet = f.formDefinition;
      $scope.$obj1.formRecForSet = f.formRecord;
      $scope.$obj1.isLoad = true;
    };

    $scope.acGetByEmp = (): void => {
      $scope.$obj1.formDefForSet = new formVm.FormDefinition();
      var f = $test.getFormDefGetByEmp($scope.$obj1.formDefForSet, $scope.$obj1.formRecForSet);
      $scope.$obj1.formDefForSet = f.formDefinition;
      $scope.$obj1.formRecForSet = f.formRecord;
      $scope.$obj1.isLoad = true;
    };

    $scope.acGetByDept = (): void => {
      $scope.$obj1.formDefForSet = new formVm.FormDefinition();
      var f = $test.getFormDefGetByDept($scope.$obj1.formDefForSet, $scope.$obj1.formRecForSet);
      $scope.$obj1.formDefForSet = f.formDefinition;
      $scope.$obj1.formRecForSet = f.formRecord;
      $scope.$obj1.isLoad = true;
    };

    $scope.acDateFilter = (): void => {
      $scope.$obj1.formDefForSet = new formVm.FormDefinition();
      var f = $test.getFormDefDateFilter($scope.$obj1.formDefForSet, $scope.$obj1.formRecForSet);
      $scope.$obj1.formDefForSet = f.formDefinition;
      $scope.$obj1.formRecForSet = f.formRecord;
      $scope.$obj1.isLoad = true;
    };

    $scope.acAddDept = (): void => {
      $scope.$obj1.formDefForSet = new formVm.FormDefinition();
      var f = $test.getFormDefAddDept($scope.$obj1.formDefForSet, $scope.$obj1.formRecForSet);
      $scope.$obj1.formDefForSet = f.formDefinition;
      $scope.$obj1.formRecForSet = f.formRecord;
      $scope.$obj1.isLoad = true;
    };

    $scope.acAddEmp = (): void => {
      $scope.$obj1.formDefForSet = new formVm.FormDefinition();
      var f = $test.getFormDefAddEmp($scope.$obj1.formDefForSet, $scope.$obj1.formRecForSet);
      $scope.$obj1.formDefForSet = f.formDefinition;
      $scope.$obj1.formRecForSet = f.formRecord;
      $scope.$obj1.isLoad = true;
    };
  }
}

// controller registration – identityServiceFile added for report userName
baseCtrl.reg(name, [
  "$scope",
  "$injector",
  SampleTestService.name,
  "$timeout",
  browseServiceFile.name,
  identityServiceFile.name,
  SampleTestCtrl
]);