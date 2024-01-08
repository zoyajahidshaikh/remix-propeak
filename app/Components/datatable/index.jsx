import React from "react";
import ReactDOM from "react-dom";
import "./datatable.css";
import Pagination from "../pagination";
import { CSVLink } from "react-csv";
// import * as jsPDF from "jspdf";
import jsPDF from 'jspdf';
import PropTypes from 'prop-types';
import * as autoTable from "jspdf-autotable";

export default class DataTable extends React.Component {
  _preSearchData = null;

  constructor(props) {
    super(props);

    this.state = {
      headers: props.headers,
      data: props.data,
      pagedData: props.data,
      sortby: null,
      descending: null,
      search: false,
      pageLength: this.props.pagination.pageLength || 5,
      currentPage: 1,
      enableEdit: props.enableEdit ? props.enableEdit : false,
      errorRow: this.props.hightlightRow ? this.props.hightlightRow : null,
      years: this.props.years,
      monthList: this.props.monthList,
      month: this.props.month,
      year: this.props.year,
      projectName: this.props.projectName,
      excelHeaders: this.props.excelHeaders,
      filename: this.props.filename,
    };

    this.keyField = props.keyField || "id"; // TODO: revisit this logic
    this.noData = props.noData || "No records found!";
    this.width = props.width || "100%";

    // Add pagination support
    this.pagination = this.props.pagination || {};
    this.showPagination = this.showPagination.bind(this);
  }

  showPagination(data) {
    return data && data.length > 0;
  }

  onDragOver = (e) => {
    e.preventDefault();
  };

  onDragStart = (e, source) => {
    e.dataTransfer.setData("text/plain", source);
  };

  onDrop = (e, target) => {
    e.preventDefault();
    let source = e.dataTransfer.getData("text/plain");
    let headers = [...this.state.headers];
    let srcHeader = headers[source];
    let targetHeader = headers[target];

    let temp = srcHeader.index;
    srcHeader.index = targetHeader.index;
    targetHeader.index = temp;

    this.setState({
      headers,
    });
  };

  renderTableHeader = () => {
    let { headers } = this.state;
    headers.sort((a, b) => {
      if (a.index > b.index) return 1;
      return -1;
    });

    let headerView = headers.map((header, index) => {
      let title = header.title;
      let cleanTitle = header.accessor;
      let width = header.width;

      if (this.state.sortby === index) {
        title += this.state.descending ? "\u2193" : "\u2191";
      }

      return (
        <th
          key={cleanTitle}
          ref={(th) => (this[cleanTitle] = th)}
          style={{ width: width }}
          data-col={cleanTitle}
          onDragStart={(e) => this.onDragStart(e, index)}
          onDragOver={this.onDragOver}
          onDrop={(e) => {
            this.onDrop(e, index);
          }}
        >
          <span draggable data-col={cleanTitle} className="header-cell">
            {title}
          </span>
        </th>
      );
    });

    return headerView;
  };

  renderNoData = () => {
    return (
      <tr>
        <td colSpan={this.props.headers.length}>{this.noData}</td>
      </tr>
    );
  };

  onUpdate = (e) => {
    e.preventDefault();
    let input = e.target.firstChild;
    let header = this.state.headers[this.state.edit.cell];
    let rowId = this.state.edit.rowId;

    this.setState({
      edit: null,
    });

    this.props.onUpdate &&
      this.props.onUpdate(header.accessor, rowId, input.value);
  };

  onFormReset = (e) => {
    if (e.keyCode === 27) {
      // ESC key
      this.setState({
        edit: null,
      });
    }
  };

  renderContent = () => {
    let { headers } = this.state;
    let data = this.pagination ? this.state.pagedData : this.state.data;
    let errorRow = this.state.errorRow;
    let contentView = data.map((row, rowIdx) => {
      let id = row[this.keyField];
      let edit = this.state.edit;
      // let errorClass = "";
      // if (errorRow && row[errorRow.accessor] === errorRow.value) {
      //     errorClass = errorRow.className;
      // }
      let tds = headers.map((header, index) => {
        let content = row[header.accessor];
        let errorClass = "";
        if (
          errorRow &&
          errorRow.accessor === header.accessor &&
          row[errorRow.accessor] === errorRow.value
        ) {
          errorClass = errorRow.className;
        }
        let cell = header.cell;
        if (cell) {
          if (typeof cell === "object") {
            if (cell.type === "image" && content) {
              content = <img style={cell.style} src={content} alt="" />;
            }
          } else if (typeof cell === "function") {
            content = cell(row);
          }
        }

        if (this.props.edit) {
          if (
            header.dataType &&
            (header.dataType === "number" || header.dataType === "string") &&
            header.accessor !== this.keyField
          ) {
            if (edit && edit.row === rowIdx && edit.cell === index) {
              content = (
                <form onSubmit={this.onUpdate}>
                  <input
                    type="text"
                    defaultValue={content}
                    onKeyUp={this.onFormReset}
                  />
                </form>
              );
            }
          }
        }

        return (
          <td key={index} data-id={id} data-row={rowIdx} className={errorClass}>
            {content}
          </td>
        );
      });
      return <tr key={rowIdx}>{tds}</tr>;
    });
    return contentView;
  };

  onSort = (e) => {
    let data = this.state.data.slice(); // Give new array
    let colIndex = ReactDOM.findDOMNode(e.target).parentNode.cellIndex;
    let colTitle = e.target.dataset.col;

    let descending = !this.state.descending;

    data.sort((a, b) => {
      let sortVal = 0;
      if (a[colTitle] < b[colTitle]) {
        sortVal = -1;
      } else if (a[colTitle] > b[colTitle]) {
        sortVal = 1;
      }
      if (descending) {
        sortVal = sortVal * -1;
      }
      return sortVal;
    });

    this.setState(
      {
        data,
        sortby: colIndex,
        descending,
      },
      () => {
        this.onGotoPage(this.state.currentPage);
      }
    );
  };

  onSearch = (e) => {
    let { headers } = this.state;

    let searchData = this._preSearchData.filter((row) => {
      let show = true;

      for (let i = 0; i < headers.length; i++) {
        let fieldName = headers[i].accessor;
        let fieldValue = row[fieldName];
        let inputId = "inp" + fieldName;
        let input = this[inputId];
        // console.log(fieldName, " ", fieldValue);
        if (
          fieldValue === null ||
          fieldValue === undefined ||
          !fieldValue === ""
        ) {
          show = true;
        } else {
          show =
            fieldValue
              .toString()
              .toLowerCase()
              .indexOf(input.value.toLowerCase()) > -1;
          if (!show) break;
        }
      }
      return show;
    });

    // UPdate the state
    this.setState(
      {
        data: searchData,
        pagedData: searchData,
        totalRecords: searchData.length,
      },
      () => {
        if (this.pagination.enabled) {
          this.onGotoPage(1);
        }
      }
    );
  };

  renderSearch = () => {
    let { search, headers } = this.state;
    if (!search) {
      return null;
    }

    let searchInputs = headers.map((header, idx) => {
      // Get the header ref.
      let hdr = this[header.accessor];
      let inputId = "inp" + header.accessor;

      return (
        <td key={idx}>
          <input
            type="text"
            ref={(input) => (this[inputId] = input)}
            style={{
              width: hdr.clientWidth - 17 + "px",
            }}
            data-idx={idx}
          />
        </td>
      );
    });

    return <tr onChange={this.onSearch}>{searchInputs}</tr>;
  };

  onShowEditor = (e) => {
    let id = e.target.dataset.id;
    this.setState({
      edit: {
        row: parseInt(e.target.dataset.row, 10),
        rowId: id,
        cell: e.target.cellIndex,
      },
    });
  };

  renderTable = () => {
    let title = this.props.title || "";
    let headerView = this.renderTableHeader();
    let contentView =
      this.state.data.length > 0 ? this.renderContent() : this.renderNoData();
    // const years = this.state.years !==undefined  && this.state.years.map((y) => {
    //     return <option key={y * .5} value={y} >{y}</option>
    // });
    // const months = this.state.monthList !==undefined && this.state.monthList.map((m) => {
    //     return <option key={m.id + m.name} value={m.id} >{m.name}</option>
    // });

    this.createPdf = () => {
      let monthly = false;
      let titles = this.state.headers.map((h) => {
        return h.title;
      });
      let values = [];
      if (this.state.data.length !== 0) {
        for (let i = 0; i < this.state.data.length; i++) {
          let tableValues = this.state.headers.map((m) => {
            return this.state.data[i][m.accessor];
          });
          values.push(tableValues);
        }
        if (this.state.year && this.state.month !== -1) {
          monthly = true;
        }

        this.exportToPdf(titles, values, monthly, title);
      } else {
        this.setState({
          noRecordsMsg: "No records to export",
        });
      }
    };

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-sm-6 ">
            {" "}
            <h5> {title} </h5>
          </div>

          {this.props.show === false ? (
            <div className="col-sm-6 text-right"> {this.renderToolbar()}</div>
          ) : (
            <div className="col-sm-6 text-right">
              {this.renderToolbar()} &nbsp; &nbsp;
              <a title="Export to Pdf" onClick={() => this.createPdf()}>
                <img
                  style={{ height: "29px", marginRight: "-6px" }}
                  src="/images/pdf.png"
                  alt="Export to Pdf"
                ></img>
              </a>
              &nbsp; &nbsp;
              <CSVLink
                data={this.state.data}
                headers={this.state.excelHeaders}
                filename={this.state.filename}
              >
                <img
                  style={{ height: "32px" }}
                  title="Export to Excel"
                  src="/images/xlsx.png"
                  alt="Export to Excel"
                ></img>
              </CSVLink>
            </div>
          )}
        </div>

        <div className="table">
          <table className="scroll">
            <thead onClick={this.onSort}>
              <tr>{headerView}</tr>
            </thead>
            <tbody onDoubleClick={this.onShowEditor}>
              {this.renderSearch()}
              {contentView}
            </tbody>
          </table>
        </div>
      </React.Fragment>
    );
  };

  onToggleSearch = (e) => {
    if (this.state.search) {
      this.setState({
        data: this._preSearchData,
        search: false,
      });
      this._preSearchData = null;
    } else {
      this._preSearchData = this.state.data;
      this.setState({
        search: true,
      });
    }
  };

  renderToolbar = () => {
    return (
      <div className="toolbar float-right" id="toolbar">
        <button
          className="btn btn-sm btn-info"
          title="Search"
          onClick={this.onToggleSearch}
        >
          <i className="fas fa-search"></i>
        </button>
      </div>
    );
  };

  getPagedData = (pageNo, pageLength) => {
    let startOfRecord = (pageNo - 1) * pageLength;
    let endOfRecord = startOfRecord + pageLength;

    let data = this.state.data;
    let pagedData = data.slice(startOfRecord, endOfRecord);

    return pagedData;
  };

  onPageLengthChange = (pageLength) => {
    this.setState(
      {
        pageLength: parseInt(pageLength, 10),
      },
      () => {
        this.onGotoPage(this.state.currentPage);
      }
    );
  };

  onGotoPage = (pageNo) => {
    let pagedData = this.getPagedData(pageNo, this.state.pageLength);
    this.setState({
      pagedData: pagedData,
      currentPage: pageNo,
    });
  };
  componentWillReceiveProps(nextProps) {
    let pagedData = nextProps.data.slice(0, this.state.pageLength);

    this.setState({
      headers: nextProps.headers, // this is used for leave listing page
    });
    // if (nextProps.data.length !== this.state.data.length) {
    this.setState({
      data: nextProps.data,
      pagedData: pagedData,
      month: nextProps.month,
      year: nextProps.year,
      dateTo: nextProps.dateTo,
      dateFrom: nextProps.dateFrom,
      projectName: nextProps.projectName,
      excelHeaders: nextProps.excelHeaders,
      filename: nextProps.filename,
    });

    //}
  }
  componentDidMount() {
    if (this.pagination.enabled) {
      this.onGotoPage(this.state.currentPage);
    }
  }
  exportToPdf(titles, values, monthly, title) {
    let projectName = this.state.projectName || "Active User Report";
    var d = new Date();
    var dateTime =
      d.getFullYear() +
      "-" +
      (d.getMonth() + 1) +
      "-" +
      d.getDate() +
      "_" +
      d.getHours() +
      "-" +
      d.getMinutes() +
      "-" +
      d.getSeconds();
    var doc = new jsPDF("p", "pt");
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.setFontStyle("normal");
    
    if (projectName) {
      doc.text(projectName, 10, 20);
      doc.autoTable(titles, values, {
        startY: doc.autoTableEndPosY() + 50,
        margin: { horizontal: 15 },
        styles: { overflow: "linebreak" },
        bodyStyles: { valign: "top" },
        columnStyles: { email: { columnWidth: "wrap" } },
        theme: "striped",
      });
      doc.save(projectName + "-" + dateTime + ".pdf");
    } else {
      console.error("Project Name is undefined!");
    }

    doc.save(projectName + "-" + dateTime + ".pdf");
  }
  // exportToPdf(titles, values, monthly, title) {
  //   let projectName = this.state.projectName;
  //   var d = new Date();
  //   var dateTime =
  //     d.getFullYear() +
  //     "-" +
  //     (d.getMonth() + 1) +
  //     "-" +
  //     d.getDate() +
  //     "_" +
  //     d.getHours() +
  //     "-" +
  //     d.getMinutes() +
  //     "-" +
  //     d.getSeconds();
  //   var doc = new jsPDF("p", "pt");
  //   doc.setFontSize(20);
  //   doc.setTextColor(40);
  //   doc.setFontStyle("normal");
  //   doc.text(projectName, 10, 20);
  //   doc.autoTable(titles, values, {
  //     startY: doc.autoTableEndPosY() + 50,
  //     margin: { horizontal: 15 },
  //     styles: { overflow: "linebreak" },
  //     bodyStyles: { valign: "top" },
  //     columnStyles: { email: { columnWidth: "wrap" } },
  //     theme: "striped",
  //   });

  //   doc.save(projectName + "-" + dateTime + ".pdf");
  // }

  render() {
    let showPagination = this.showPagination(this.state.data);
    return (
      <div id="datatable">
        <div className={this.props.className}>
          {this.renderTable()}

          {this.pagination.enabled && showPagination && (
            <React.Fragment>
              <Pagination
                type={this.props.pagination.type}
                totalRecords={this.state.data.length}
                pageLength={this.state.pageLength}
                onPageLengthChange={this.onPageLengthChange}
                onGotoPage={this.onGotoPage}
                currentPage={this.state.currentPage}
              />
            </React.Fragment>
          )}
        </div>
      </div>
    );
  }
}
