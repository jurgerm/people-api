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
4. GET/POST/DELETE į "/cars" paduoda visus automobilius iš duomenų bazės/įrašo naują automobilį
į duomenų bazę/ištrina automobilį pagal ID.

5. Pakoreguokite GET, kad "/cars/" paduotų visus automobilius,
 "/cars/:id" paduotų vieną automobilį pagal ID.

6. Detaliai patestuokite skirtingus scenarijus su PostMan:

    GET: jei viskas gerai;
     jei vartotojas įrašo neteisingą ID;
    jei duomenų bazė neveikia (pvz. pass neteisingas)
 */
router.get(
    "/cars/:id?",
    query(
        "sort",
        "Invalid sort direction. Allowed values: ASC, DESC"
    ).custom(sortValidator),
    validateErrorsMiddleware,
    async (req, res) => {
        const { mysql } = req.app;
        const { limit = 10, sort = "ASC" } = req.query;
        const id = req.params.id;
        try {
            let filterString = "";
            if (id) {
                filterString = `
                  WHERE
                      id = '${escape(id)}'
                  `;
            }
            const [cars] = await mysql.query(
                `
                SELECT 
                  * 
                FROM cars
                ${filterString}
                ORDER BY 
                  price ${sort}
                LIMIT ?
                `,
                [
                    Number(limit)
                ]
            );
            //  Tikrinimas kai vartotojas įrašo neteisingą ID:
            // reikia patikriti dvi salygas:
            // 1. Yra paduotas ID
            //  ir 2. užklausa negrąžina mašinų
            if (id && cars.length === 0) {
                return res.status(404).send({
                    message: `No car with id: ${id}`,
                });
            }
            else {
                res.send({
                    cars,
                    limit: Number(limit),
                    sort,
                });
            }
        } catch (error) {
            sendError(error, res);
        }
    }
);

/**
 * 4. POST "/cars" - įrašo automobilį.
 */
router.post(
    "/cars",
    body(["title", "image", "price", "numberplates"], "Missing param").exists(),
    body(["title", "image", "numberplates"]).isString(),
    body("price").isFloat({ min: 1 }),
    validateErrorsMiddleware,
    async (req, res) => {
        const { mysql } = req.app;
        const {
            title,
            image,
            price,
            numberplates
        } = req.body;

        try {
            const [{ insertId }] = await mysql.query(
                `
                INSERT INTO cars
                  (title, image, price, numberplates)
                  values
                  ( ?, ?, ?, ?)
                  `,
                [
                    title,
                    image,
                    Number(price),
                    numberplates
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
 * 2.4. GET "*" - išmeta, kad tokio puslapio nėra.
 */
router.get("*", (req, res) => {
    return res.status(404).send({
        message: "Route does not exist",
    });
});

/**4. Ištrina automobilį pagal ID
 */

router.delete("/car/:id", async (req, res) => {
    const { mysql } = req.app;
    const id = Number(req.params.id);

    try {
        const [{ affectedRows }] = await mysql.query(
            `DELETE FROM cars WHERE id=${id};`
        );

        if (!affectedRows) {
            return res.status(404).send({
                error: `No car with such id: ${id}`,
            });
        }

        res.send({
            deletedId: id,
        });
    } catch (error) {
        if (error.code === "ER_BAD_FIELD_ERROR") {
            return sendError(new Error("Bad car id"), res);
        }

        sendError(error, res);
    }
});

export default router;
