// we received that function as fn and return the wrap of same funcion with catch error
module.exports = (fn) => {
  // fn(req, res, next).catch((err) => next(err)); // we cannot do this because it will call that funciton right away
  // it will also call right away, but we need pass it and call whenever events are emitted
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
    //    fn(req,res,next).catch(next);
  };
};
