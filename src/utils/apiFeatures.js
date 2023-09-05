export class ApiFeatures {
  constructor(mongooseQuery, queryData) {
    this.mongooseQuery = mongooseQuery;
    this.queryData = queryData;
  }
  pagination = (model) => {
    let page = this.queryData.page;
    let size = this.queryData.size;
    if (!page || page <= 0) page = 1;
    if (!size || size <= 0) size = 5;
    const skip = (page - 1) * size;
    this.mongooseQuery.skip(skip).limit(size);
    model.countDocuments().then((value) => {
      this.queryData.totalPage = Math.ceil(value / size);
      if (this.queryData.totalPage > page) {
        this.queryData.next = Number(page) + 1;
      }
      if (page > 1) {
        this.queryData.previous = Number(page) - 1;
      }
      this.queryData.count = value;
    });
    return this;
  };
  filter = () => {
    const excluded = ["sort", "page", "size", "searchKey", "fields"];
    let filterQuery = { ...this.queryData };
    excluded.forEach((ele) => {
      delete filterQuery[ele];
    });
    filterQuery = JSON.parse(
      JSON.stringify(filterQuery).replace(/lt|lte|gt|gte/g, (match) => {
        return `$${match}`;
      })
    );
    this.mongooseQuery.find(filterQuery);
    return this;
  };
  sort = () => {
    this.mongooseQuery.sort(this.queryData.sort?.replace(",", " "));
    return this;
  };
  search = () => {
    if (this.queryData.searchKey) {
      this.mongooseQuery.find({
        $or: [
          { name: { $regex: this.queryData.searchKey } },
          { description: { $regex: this.queryData.searchKey } },
        ],
      });
    }
    return this;
  };
  select = () => {
    this.mongooseQuery.select(this.queryData.fields?.replace(",", " "));
    return this;
  };
}
