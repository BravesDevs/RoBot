import { getConnection } from "./dbConn";

export const isEmailWaitListed = async (email:string) => {
    const conn = getConnection();
    const query = `SELECT isWaitListed FROM user_records WHERE email = ?`;
    return new Promise((resolve, reject) => {
        conn.query(query, [email], (err, results) => {
            if (err) {
                reject(err);
            }
            resolve(results);
        });
    });
};