const checkEntitlements = (userRole) => {
    if (!userRole) {
        // res.json({ err: errors.NOT_AUTHORIZED });
        return false;
    }
    else if (userRole !== "admin" && userRole !== "owner") {
        // res.json({ err: errors.NOT_AUTHORIZED });
        return false;
    } else {
        return true;
    }
  }

  const checkEntitlementsForUserRole = (userRole) => {
    if (!userRole) {
        // res.json({ err: errors.NOT_AUTHORIZED });
        return false;
    } else {
        return true;
    }
  }

  module.exports = access ={checkEntitlements : checkEntitlements, checkEntitlementsForUserRole: checkEntitlementsForUserRole};