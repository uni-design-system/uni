import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UniRecordDatasource } from './record-datasource';
import type { Sort } from './base-datasource';

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

@Component({
  selector: 'uni-datasource-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h2>Datasource Demo</h2>

      <div class="controls">
        <div class="filter-controls">
          <label>Filter by minimum age:</label>
          <input type="number" [value]="minAge" (input)="updateFilter($event)" min="0" max="100" />
        </div>

        <div class="sort-controls">
          <button (click)="sortBy('name')">Sort by Name</button>
          <button (click)="sortBy('age')">Sort by Age</button>
          @if (currentSort.column) {
            <span> Sorting by: {{ currentSort.column }} ({{ currentSort.direction }}) </span>
          }
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          @for (user of users; track user.id) {
            <tr [class.selected]="datasource.isSelected(user)">
              <td>
                <input
                  type="checkbox"
                  [checked]="datasource.isSelected(user)"
                  (change)="datasource.toggleSelection(user)"
                />
              </td>
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.age }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="pagination">
        <button (click)="datasource.firstPage()" [disabled]="datasource.disablePrevious()">
          First
        </button>
        <button (click)="datasource.previousPage()" [disabled]="datasource.disablePrevious()">
          Previous
        </button>

        @for (page of datasource.truncatedPages(); track page) {
          <span>
            @if (page !== '...') {
              <button [class.active]="page === currentPage" (click)="goToPage(page)">
                {{ page }}
              </button>
            }
            @if (page === '...') {
              <span>...</span>
            }
          </span>
        }

        <button (click)="datasource.nextPage()" [disabled]="datasource.disableNext()">Next</button>
        <button (click)="datasource.lastPage()" [disabled]="datasource.disableNext()">Last</button>
      </div>

      <div class="selection-info">
        <p>Selected users: {{ datasource.selections().length }}</p>
        @if (datasource.selections().length > 0) {
          <ul>
            @for (selected of datasource.selections(); track selected.id) {
              <li>{{ selected.name }} ({{ selected.email }})</li>
            }
          </ul>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
      }

      .controls {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }

      th,
      td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }

      th {
        background-color: #f2f2f2;
      }

      tr.selected {
        background-color: #e6f7ff;
      }

      .pagination {
        display: flex;
        justify-content: center;
        gap: 5px;
        margin-bottom: 20px;
      }

      button {
        padding: 5px 10px;
        cursor: pointer;
      }

      button.active {
        background-color: #1890ff;
        color: white;
        border: none;
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .selection-info {
        margin-top: 20px;
      }
    `,
  ],
})
export class DatasourceStoryComponent implements OnInit {
  // Sample data
  userData: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 32 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 28 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 45 },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 24 },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', age: 38 },
    { id: 6, name: 'Diana Miller', email: 'diana@example.com', age: 41 },
    { id: 7, name: 'Edward Davis', email: 'edward@example.com', age: 19 },
    { id: 8, name: 'Fiona Clark', email: 'fiona@example.com', age: 36 },
    { id: 9, name: 'George White', email: 'george@example.com', age: 52 },
    { id: 10, name: 'Hannah Moore', email: 'hannah@example.com', age: 29 },
    { id: 11, name: 'Ian Taylor', email: 'ian@example.com', age: 33 },
    { id: 12, name: 'Julia Adams', email: 'julia@example.com', age: 27 },
    { id: 13, name: 'Kevin Martin', email: 'kevin@example.com', age: 44 },
    { id: 14, name: 'Laura Wilson', email: 'laura@example.com', age: 31 },
    { id: 15, name: 'Michael Brown', email: 'michael@example.com', age: 39 },
  ];

  // Create datasource
  datasource = new UniRecordDatasource<User>(this.userData);

  // Current page and filter values
  currentPage = 1;
  minAge = 0;
  currentSort: Sort<User> = { direction: 'indet' };

  // Computed property for current records
  get users(): User[] {
    return this.datasource.records();
  }

  ngOnInit() {
    // Initialize with 5 items per page
    this.datasource.setPageSize(5);

    // Set initial filter
    this.updateFilterValue(this.minAge);
  }

  updateFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10) || 0;
    this.minAge = value;
    this.updateFilterValue(value);
  }

  updateFilterValue(value: number) {
    this.datasource.setFilter((user) => user.age >= value);
    // Reset to first page when filter changes
    this.datasource.firstPage();
    this.currentPage = 1;
  }

  sortBy(column: keyof User) {
    const currentSort = this.datasource.sort();
    let direction: 'asc' | 'desc' | 'indet' = 'asc';

    if (currentSort.column === column) {
      // Toggle direction if same column
      direction =
        currentSort.direction === 'asc'
          ? 'desc'
          : currentSort.direction === 'desc'
            ? 'indet'
            : 'asc';
    }

    this.currentSort = { column, direction };
    this.datasource.sortRecords(this.currentSort);
  }

  goToPage(page: string | number) {
    if (typeof page === 'number') {
      this.datasource.jumpToPage(page);
    }
  }
}
