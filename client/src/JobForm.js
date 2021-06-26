import React, { Component } from 'react';

// mutation query
import { createJob } from './graphql/queries';

export class JobForm extends Component {
  constructor(props) {
    super(props);
    this.state = { title: '', description: '' };
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleClick(event) {
    event.preventDefault();

    // local state
    const { title, description } = this.state;

    // const companyId = 'SJV0-wdOM'; //FIX ME
    // This is getting auto set from 'context' in resolvers.js

    // mutation query
    createJob({ title, description })
      // mutation returns a promise
      .then(job => {
        // server automatically assigns companyId to a new job based on the authenticated user
        // since user has a companyId field associated with it &
        // it's more secure since each user can create job for their own company

        // to make sure that user navigates only after mutation has been successfully submitted to the server
        this.props.history.push(`/jobs/${job.id}`);
      });
    console.log('should post a new job:', this.state);
  }

  render() {
    const { title, description } = this.state;
    return (
      <div>
        <h1 className='title'>New Job</h1>
        <div className='box'>
          <form>
            <div className='field'>
              <label className='label'>Title</label>
              <div className='control'>
                <input
                  className='input'
                  type='text'
                  name='title'
                  value={title}
                  onChange={this.handleChange.bind(this)}
                />
              </div>
            </div>
            <div className='field'>
              <label className='label'>Description</label>
              <div className='control'>
                <textarea
                  className='input'
                  style={{ height: '10em' }}
                  name='description'
                  value={description}
                  onChange={this.handleChange.bind(this)}
                />
              </div>
            </div>
            <div className='field'>
              <div className='control'>
                <button className='button is-link' onClick={this.handleClick.bind(this)}>
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
