class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1: filtering
    //console.log(req.query);
    const queryObj = { ...this.queryString }; // destructing bcz we want to create an object which will not chnaged. JS is pass by reference
    //const queryObj = req.query; // pass by referecnce, if we change queryObj, it will change req.query
    const excludedFields = ['page', 'limit', 'sort', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]);
    // BUILD THE QUERY

    //2: Advance Filtering
    let queryStr = JSON.stringify(queryObj); // for mutation we defiene as let
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    //let query = Tour.find(JSON.parse(queryStr)); // we are using query bcz it has to chain with other methods, so it cannot wait for  await Tour.find() method to be completed before it moves to another
    console.log(this.queryString);

    return this; // entire obejct
  }
  sort() {
    if (this.queryString.sort) {
      console.log('sort value from query: ' + this.queryString.sort);
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log('after split:' + sortBy);
      //query = query.sort(req.query.sort);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    console.log(this.queryString);

    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    console.log(this.queryString);

    return this;
  }
  paginate() {
    // 4) Pagination
    // page2&limit=10, we skip 2 pages before we star querying
    const page = this.queryString.page * 1 || 1; // by default 1
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    console.log(this.queryString);
    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This Page doesnot exits  ');
    // }
    return this;
  }
}

module.exports = APIFeatures;

//Bulding Query - removing the excluded fields
// // 1: filtering
// console.log(req.query);
// const queryObj = { ...req.query }; // destructing bcz we want to create an object which will not chnaged. JS is pass by reference
// //const queryObj = req.query; // pass by referecnce, if we change queryObj, it will change req.query
// const excludedFields = ['page', 'limit', 'sort', 'fields'];

// excludedFields.forEach((el) => delete queryObj[el]);
// // BUILD THE QUERY

// //2: Advance Filtering
// let queryStr = JSON.stringify(queryObj); // for mutation we defiene as let
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
// //console.log(JSON.parse(queryStr));
// let query = Tour.find(JSON.parse(queryStr)); // we are using query bcz it has to chain with other methods, so it cannot wait for  await Tour.find() method to be completed before it moves to another

// 2: Sorting
// if (req.query.sort) {
//   console.log('sort value from query: ' + req.query.sort);
//   const sortBy = req.query.sort.split(',').join(' ');
//   console.log('after split:' + sortBy);
//   //query = query.sort(req.query.sort);
//   query = query.sort(sortBy);
// } else {
//   query = query.sort('-createdAt');
// }

//3 Field Limiting -- for Data heavy applications
// name duration
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields);
// } else {
//   query = query.select('-__v');
// }

// // 4) Pagination
// // page2&limit=10, we skip 2 pages before we star querying
// const page = req.query.page * 1 || 1; // by default 1
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;
// if (req.query.page) {
//   const numTours = await Tour.countDocuments();
//   if (skip >= numTours) throw new Error('This Page doesnot exits  ');
// }
