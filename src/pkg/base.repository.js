// --- CREATE OPERATIONS ---

export const create = async ({
    model,
    data = [{}],
    options = { validateBeforeSave: true },
  } = {}) => {
    return await model.create(data, options);
  };
  
  export const createOne = async ({
    model,
    data = {},
    options = { validateBeforeSave: true },
  } = {}) => {
    const [doc] = await create({ model, data: [data], options });
    return doc;
  };
  
  // --- READ OPERATIONS ---
  
  export const findOne = async ({
    model,
    filter = {},
    select = '',
    options = {},
  } = {}) => {
    let doc = model.findOne(filter).select(select);
  
    if (options.populate) doc.populate(options.populate);
    if (options.lean) doc.lean();
  
    return await doc.exec();
  };
  
  export const findById = async ({
    model,
    id,
    select = '',
    options = {},
  } = {}) => {
    let doc = model.findById(id).select(select);
  
    if (options.populate) doc.populate(options.populate);
    if (options.lean) doc.lean();
  
    return await doc.exec();
  };
  
  export const find = async ({
    model,
    filter = {},
    select = '',
    options = {},
  } = {}) => {
    let doc = model.find(filter).select(select);
  
    if (options.populate) doc.populate(options.populate);
    if (options.lean) doc.lean();
  
    return await doc.exec();
  };
  
  // --- UPDATE OPERATIONS ---
  
  export const updateOne = async ({
    model,
    filter = {},
    update = {},
    options = {},
  } = {}) => {
    const updateData = {
      ...update,
      $inc: { __v: 1 },
    };
  
    return await model.updateOne(filter, updateData, options);
  };
  
  export const findOneAndUpdate = async ({
    model,
    filter = {},
    update = {},
    options = { new: true, runValidators: true },
  } = {}) => {
    const updateData = {
      ...update,
      $inc: { __v: 1 },
    };
  
    let doc = model.findOneAndUpdate(filter, updateData, options);
  
    if (options.populate) doc.populate(options.populate);
    if (options.lean) doc.lean();
  
    return await doc.exec();
  };
  
  export const findByIdAndUpdate = async ({
    model,
    id,
    update = {},
    options = { new: true, runValidators: true },
  } = {}) => {
    return await findOneAndUpdate({
      model,
      filter: { _id: id },
      update,
      options,
    });
  };
  
  export const updateMany = async ({
    model,
    filter = {},
    update = {},
    options = {},
  } = {}) => {
    const updateData = {
      ...update,
      $inc: { __v: 1 },
    };
  
    return await model.updateMany(filter, updateData, options);
  };
  
  // --- DELETE OPERATIONS ---
  
  export const findOneAndDelete = async ({
    model,
    filter = {},
    options = {},
  } = {}) => {
    let doc = model.findOneAndDelete(filter, options);
  
    if (options.populate) doc.populate(options.populate);
    if (options.lean) doc.lean();
  
    return await doc.exec();
  };
  
  export const deleteOne = async ({
    model,
    filter = {},
    options = {},
  } = {}) => {
    return await model.deleteOne(filter, options);
  };
  
  export const deleteMany = async ({
    model,
    filter = {},
    options = {},
  } = {}) => {
    return await model.deleteMany(filter, options);
  };