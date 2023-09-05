export const pagination = (page, size) => {
  if (!page || page <= 0) page = 1;
  if (!size || size <= 0) size = 5;
  const skip = parseInt(page - 1) * parseInt(size);
  return { skip, limit: parseInt(size) };
};
