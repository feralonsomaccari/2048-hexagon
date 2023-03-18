/* eslint-disable no-undef */
require("expect-puppeteer")

const { Server } = require("../rng-server/rngServer")
const { readDOMField, setupPage, pressDirectionKeys, createSerialServerHandler } = require("./utils")

let server
let radius

const urlArg = process.argv.filter((x) => x.startsWith("--url="))[0]
const href = (urlArg && urlArg.replace("--url=", "")) || "http://localhost:3000/"

describe("Hex game launch", () => {
  beforeAll(async () => {
    server = new Server(true)
    await server.start()
  }, 10000)

  afterAll(async () => {
    await server.end()
  }, 15000)

  describe("radius 2", () => {
    radius = 2
    describe("few moves", () => {
      it("should process serial of moves and numbers", async () => {
        const serverHandler = createSerialServerHandler([
          [
            { x: 0, y: 1, z: -1, value: 2 },
            { x: 0, y: 0, z: 0, value: 2 },
          ],
          [
            { x: -1, y: 0, z: 1, value: 4 },
            { x: 0, y: 0, z: 0, value: 4 },
          ],
        ])
        const expected = [
          { value: 2, x: 0, y: 0, z: 0 },
          { value: 2, x: 0, y: -1, z: 1 },
          { value: 8, x: -1, y: 0, z: 1 },
        ]
        server.changeHandler(serverHandler)

        const page = await setupPage(browser, href, radius)
        await pressDirectionKeys(page, "DA")

        const field = await readDOMField(page, radius)
        expect(field.filter(({ value }) => value > 0)).toEqual(expect.arrayContaining(expected))

        await page.close()
      }, 10000)
    })
  })
})
