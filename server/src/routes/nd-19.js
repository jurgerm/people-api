import { Router } from "express";
import { sendError } from "../utils/error.js";
import { body, query } from "express-validator";
import { sortValidator } from "../utils/validatorsSql.js";
import { validateErrorsMiddleware } from "../utils/validateErrorsMiddleware.js";

const router = Router();

/**
 * 2.1. GET "/" - išmeta, kad serveris funkcionuoja.
 */
router.get("/", async (req, res) => {

    res.send({
        message: "Serveris veikia"
    });
});

/**
 * 2.2 GET "/shirts" - išmeta 10 pigiausių marškinių (naudojam MySQL LIMIT ir ORDER BY).
 *
 * Sukuriame GET route '/products/:id' - šis dinaminis -
 *  pagal paduodamą ID grąžins specifinį produktą iš duomenų bazės.
 *
 * 3. Pakoreguojame GET "/shirts", kad leistų pagal dydį filtruoti ("/shirts/:size")
 *  ir grąžintų 10 pigiausių to dydžio'o.
 *  Tačiau jei dydis neparašytas - grąžintų, kaip ir anksčiau, visų dydžių 10 pigiausių.
 *
 * 4. Pakoreguokime, kad LIMIT skaičius būtų pagal search parametrą, tarp 10 ir 100.
 *    Linko pvz.: "/shirts/M?limit=20" (naudojame req.query).
 */
router.get(
    "/shirts/:size?",
    query(
        "sort",
        "Invalid sort direction. Allowed values: ASC, DESC"
    ).custom(sortValidator),
    validateErrorsMiddleware,
    async (req, res) => {
        const { mysql } = req.app;
        const { limit = 10, sort = "ASC" } = req.query;
        const size = req.params.size;
        try {
            let filterString = "";
            if (size) {
                filterString = `
                  WHERE
                      size = '${escape(size)}'
                  `;
            }
            const [shirts] = await mysql.query(
                `
                SELECT 
                  * 
                FROM shirts
                ${filterString}
                ORDER BY 
                  price ${sort}
                LIMIT ?
                `,
                [
                    Number(limit)
                ]
            );

            res.send({
                shirts,
                limit: Number(limit),
                sort,
            });
        } catch (error) {
            sendError(error, res);
        }
    }
);

/**
 *  POST "/product" - įrašo vieną produktą.
 */
router.post(
    "/product",
    body(["title", "image", "price"], "Missing param").exists(),
    body(["title", "image"]).isString(),
    body("price").isFloat({ min: 1 }),
    validateErrorsMiddleware,
    async (req, res) => {
        const { mysql } = req.app;
        const {
            title,
            image,
            price
        } = req.body;

        try {
            const [{ insertId }] = await mysql.query(
                `
                INSERT INTO nd19_products
                  (title, image, price)
                  values
                  ( ?, ?, ?)
                  `,
                [
                    title,
                    image,
                    Number(price)
                ]
            );

            res.send({
                added: { ...req.body, id: insertId },
            });
        } catch (error) {
            sendError(error, res);
        }
    }
);

/**
 *  GET "*" - išmeta, kad tokio puslapio nėra.
 */
router.get("*", (req, res) => {
    return res.status(404).send({
        message: "Route does not exist",
    });
});

export default router;
