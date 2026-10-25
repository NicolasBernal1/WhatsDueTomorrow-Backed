window.__SERENITY_REPORT_DATA__ = {
  "schemaVersion": 1,
  "summary": {
    "title": "whats-due-tomorrow-bdd",
    "totalScenarios": 4,
    "outcomes": {
      "passed": 4,
      "failed": 0,
      "pending": 0,
      "skipped": 0,
      "compromised": 0,
      "error": 0
    },
    "duration": 14204,
    "startedAt": "2026-10-25T01:19:02.258Z",
    "finishedAt": "2026-10-25T01:19:16.462Z",
    "testRunner": "Cucumber"
  },
  "scenarios": [
    {
      "name": "Visualización de la vista del radar de entregas urgentes",
      "category": "F21 - Alertas y radar de entregas urgentes",
      "outcome": "SUCCESS",
      "duration": 5103,
      "startedAt": "2026-10-25T01:19:02.258Z",
      "source": {
        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
        "line": 9
      },
      "tags": [
        {
          "type": "feature",
          "name": "F21 - Alertas y radar de entregas urgentes"
        },
        {
          "type": "tag",
          "name": "f21"
        },
        {
          "type": "tag",
          "name": "radar"
        },
        {
          "type": "tag",
          "name": "screenplay"
        },
        {
          "type": "tag",
          "name": "smoke"
        },
        {
          "type": "tag",
          "name": "exitoso"
        }
      ],
      "activities": [
        {
          "name": "Dado que Alicia abre la aplicación e inicia sesión en la plataforma",
          "outcome": "SUCCESS",
          "duration": 4721,
          "children": [
            {
              "name": "Alicia inicia sesión con \"estudiante.screenplay.31326@example.com\"",
              "outcome": "SUCCESS",
              "duration": 3857,
              "children": [
                {
                  "name": "Alicia navigates to \"/login\"",
                  "outcome": "SUCCESS",
                  "duration": 690,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:03.124Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 18,
                    "column": 19
                  }
                },
                {
                  "name": "Alicia waits until campo de correo does become visible",
                  "outcome": "SUCCESS",
                  "duration": 63,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:03.815Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 18,
                    "column": 19
                  }
                },
                {
                  "name": "Alicia enters \"estudiante.screenplay.31326@example.com\" into campo de correo",
                  "outcome": "SUCCESS",
                  "duration": 10,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:03.878Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                    "line": 11,
                    "column": 27
                  }
                },
                {
                  "name": "Alicia enters [a masked value] into campo de contraseña",
                  "outcome": "SUCCESS",
                  "duration": 8,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:03.889Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                    "line": 12,
                    "column": 46
                  }
                },
                {
                  "name": "Alicia clicks on botón Log In",
                  "outcome": "SUCCESS",
                  "duration": 74,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:03.897Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                    "line": 13,
                    "column": 11
                  }
                },
                {
                  "name": "Alicia waits for 3s",
                  "outcome": "SUCCESS",
                  "duration": 3009,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:03.971Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 18,
                    "column": 19
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:03.123Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                "line": 18,
                "column": 19
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:02.260Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
            "line": 10
          }
        },
        {
          "name": "Cuando ella consulta el radar de entregas urgentes",
          "outcome": "SUCCESS",
          "duration": 326,
          "children": [
            {
              "name": "Alicia consulta el radar de entregas urgentes",
              "outcome": "SUCCESS",
              "duration": 320,
              "children": [
                {
                  "name": "Alicia navigates to \"/urgent-radar\"",
                  "outcome": "SUCCESS",
                  "duration": 271,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:06.988Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 24,
                    "column": 20
                  }
                },
                {
                  "name": "Alicia waits until título del radar de entregas urgentes does become visible",
                  "outcome": "SUCCESS",
                  "duration": 47,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:07.260Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 24,
                    "column": 20
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:06.988Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                "line": 24,
                "column": 20
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:06.982Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
            "line": 11
          }
        },
        {
          "name": "Entonces ella observa el título \"Urgent assignments radar\"",
          "outcome": "SUCCESS",
          "duration": 8,
          "children": [
            {
              "name": "Alicia ensures that the text of título del radar de entregas urgentes does equal \"Urgent assignments radar\"",
              "outcome": "SUCCESS",
              "duration": 3,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-10-25T01:19:07.313Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                "line": 30,
                "column": 12
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:07.308Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
            "line": 12
          }
        },
        {
          "name": "Y el radar de entregas urgentes está visible en pantalla",
          "outcome": "SUCCESS",
          "duration": 21,
          "children": [
            {
              "name": "Alicia ensures that título del radar de entregas urgentes does become visible",
              "outcome": "SUCCESS",
              "duration": 19,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-10-25T01:19:07.319Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                "line": 36,
                "column": 12
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:07.317Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
            "line": 13
          }
        },
        {
          "name": "After",
          "outcome": "SUCCESS",
          "duration": 9,
          "children": [],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:07.339Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/support/serenity.config.ts",
            "line": 39
          }
        }
      ],
      "executionHistory": [
        {
          "outcome": "SUCCESS",
          "run": "2026-10-25T01-16-18.365Z",
          "timestamp": "2026-10-25T01:16:04.167Z",
          "duration": 5365,
          "activities": [
            {
              "name": "Dado que Alicia abre la aplicación e inicia sesión en la plataforma",
              "outcome": "SUCCESS",
              "duration": 5002,
              "children": [
                {
                  "name": "Alicia inicia sesión con \"estudiante.screenplay.263617@example.com\"",
                  "outcome": "SUCCESS",
                  "duration": 4173,
                  "children": [
                    {
                      "name": "Alicia navigates to \"/login\"",
                      "outcome": "SUCCESS",
                      "duration": 992,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:04.996Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    },
                    {
                      "name": "Alicia waits until campo de correo does become visible",
                      "outcome": "SUCCESS",
                      "duration": 59,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:05.989Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    },
                    {
                      "name": "Alicia enters \"estudiante.screenplay.263617@example.com\" into campo de correo",
                      "outcome": "SUCCESS",
                      "duration": 9,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:06.048Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 11,
                        "column": 27
                      }
                    },
                    {
                      "name": "Alicia enters [a masked value] into campo de contraseña",
                      "outcome": "SUCCESS",
                      "duration": 9,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:06.057Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 12,
                        "column": 46
                      }
                    },
                    {
                      "name": "Alicia clicks on botón Log In",
                      "outcome": "SUCCESS",
                      "duration": 95,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:06.067Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 13,
                        "column": 11
                      }
                    },
                    {
                      "name": "Alicia waits for 3s",
                      "outcome": "SUCCESS",
                      "duration": 3007,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:06.162Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:16:04.996Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 18,
                    "column": 19
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:04.169Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 10
              }
            },
            {
              "name": "Cuando ella consulta el radar de entregas urgentes",
              "outcome": "SUCCESS",
              "duration": 319,
              "children": [
                {
                  "name": "Alicia consulta el radar de entregas urgentes",
                  "outcome": "SUCCESS",
                  "duration": 313,
                  "children": [
                    {
                      "name": "Alicia navigates to \"/urgent-radar\"",
                      "outcome": "SUCCESS",
                      "duration": 265,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:09.177Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 24,
                        "column": 20
                      }
                    },
                    {
                      "name": "Alicia waits until título del radar de entregas urgentes does become visible",
                      "outcome": "SUCCESS",
                      "duration": 47,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:09.443Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 24,
                        "column": 20
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:16:09.177Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 24,
                    "column": 20
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:09.171Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 11
              }
            },
            {
              "name": "Entonces ella observa el título \"Urgent assignments radar\"",
              "outcome": "SUCCESS",
              "duration": 8,
              "children": [
                {
                  "name": "Alicia ensures that the text of título del radar de entregas urgentes does equal \"Urgent assignments radar\"",
                  "outcome": "SUCCESS",
                  "duration": 3,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:16:09.495Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 30,
                    "column": 12
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:09.491Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 12
              }
            },
            {
              "name": "Y el radar de entregas urgentes está visible en pantalla",
              "outcome": "SUCCESS",
              "duration": 12,
              "children": [
                {
                  "name": "Alicia ensures that título del radar de entregas urgentes does become visible",
                  "outcome": "SUCCESS",
                  "duration": 9,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:16:09.502Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 36,
                    "column": 12
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:09.499Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 13
              }
            },
            {
              "name": "After",
              "outcome": "SUCCESS",
              "duration": 7,
              "children": [],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:09.512Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/support/serenity.config.ts",
                "line": 39
              }
            }
          ]
        },
        {
          "outcome": "SUCCESS",
          "run": "2026-10-25T01-19-16.444Z",
          "timestamp": "2026-10-25T01:19:02.258Z",
          "duration": 5103,
          "activities": [
            {
              "name": "Dado que Alicia abre la aplicación e inicia sesión en la plataforma",
              "outcome": "SUCCESS",
              "duration": 4721,
              "children": [
                {
                  "name": "Alicia inicia sesión con \"estudiante.screenplay.31326@example.com\"",
                  "outcome": "SUCCESS",
                  "duration": 3857,
                  "children": [
                    {
                      "name": "Alicia navigates to \"/login\"",
                      "outcome": "SUCCESS",
                      "duration": 690,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:03.124Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    },
                    {
                      "name": "Alicia waits until campo de correo does become visible",
                      "outcome": "SUCCESS",
                      "duration": 63,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:03.815Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    },
                    {
                      "name": "Alicia enters \"estudiante.screenplay.31326@example.com\" into campo de correo",
                      "outcome": "SUCCESS",
                      "duration": 10,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:03.878Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 11,
                        "column": 27
                      }
                    },
                    {
                      "name": "Alicia enters [a masked value] into campo de contraseña",
                      "outcome": "SUCCESS",
                      "duration": 8,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:03.889Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 12,
                        "column": 46
                      }
                    },
                    {
                      "name": "Alicia clicks on botón Log In",
                      "outcome": "SUCCESS",
                      "duration": 74,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:03.897Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 13,
                        "column": 11
                      }
                    },
                    {
                      "name": "Alicia waits for 3s",
                      "outcome": "SUCCESS",
                      "duration": 3009,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:03.971Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:19:03.123Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 18,
                    "column": 19
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:02.260Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 10
              }
            },
            {
              "name": "Cuando ella consulta el radar de entregas urgentes",
              "outcome": "SUCCESS",
              "duration": 326,
              "children": [
                {
                  "name": "Alicia consulta el radar de entregas urgentes",
                  "outcome": "SUCCESS",
                  "duration": 320,
                  "children": [
                    {
                      "name": "Alicia navigates to \"/urgent-radar\"",
                      "outcome": "SUCCESS",
                      "duration": 271,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:06.988Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 24,
                        "column": 20
                      }
                    },
                    {
                      "name": "Alicia waits until título del radar de entregas urgentes does become visible",
                      "outcome": "SUCCESS",
                      "duration": 47,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:07.260Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 24,
                        "column": 20
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:19:06.988Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 24,
                    "column": 20
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:06.982Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 11
              }
            },
            {
              "name": "Entonces ella observa el título \"Urgent assignments radar\"",
              "outcome": "SUCCESS",
              "duration": 8,
              "children": [
                {
                  "name": "Alicia ensures that the text of título del radar de entregas urgentes does equal \"Urgent assignments radar\"",
                  "outcome": "SUCCESS",
                  "duration": 3,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:07.313Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 30,
                    "column": 12
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:07.308Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 12
              }
            },
            {
              "name": "Y el radar de entregas urgentes está visible en pantalla",
              "outcome": "SUCCESS",
              "duration": 21,
              "children": [
                {
                  "name": "Alicia ensures that título del radar de entregas urgentes does become visible",
                  "outcome": "SUCCESS",
                  "duration": 19,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:07.319Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 36,
                    "column": 12
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:07.317Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 13
              }
            },
            {
              "name": "After",
              "outcome": "SUCCESS",
              "duration": 9,
              "children": [],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:07.339Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/support/serenity.config.ts",
                "line": 39
              }
            }
          ]
        }
      ],
      "narrative": "<p>Como estudiante universitario\nQuiero monitorear mis entregas urgentes en una vista dedicada\nPara priorizar mis compromisos académicos de las próximas 24 horas</p>\n",
      "cast": [
        {
          "name": "Alicia",
          "abilities": [
            {
              "name": "PerformActivities"
            },
            {
              "name": "AnswerQuestions"
            },
            {
              "name": "RaiseErrors"
            },
            {
              "name": "ScheduleWork",
              "details": "{\"scheduler\":{\"clock\":{\"timeAdjustment\":{\"milliseconds\":0}},\"interactionTimeout\":{\"milliseconds\":5000}}}"
            },
            {
              "name": "CallAnApi",
              "details": "{\"baseURL\":\"https://whatsduetomorrow-backed.onrender.com\",\"headers\":{\"common\":{\"Accept\":\"application/json, text/plain, */*\"}},\"timeout\":10000}"
            },
            {
              "name": "BrowseTheWebWithPlaywright"
            }
          ]
        }
      ],
      "id": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature:9"
    },
    {
      "name": "Radar despejado cuando no existen entregas urgentes",
      "category": "F21 - Alertas y radar de entregas urgentes",
      "outcome": "SUCCESS",
      "duration": 4288,
      "startedAt": "2026-10-25T01:19:07.365Z",
      "source": {
        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
        "line": 16
      },
      "tags": [
        {
          "type": "feature",
          "name": "F21 - Alertas y radar de entregas urgentes"
        },
        {
          "type": "tag",
          "name": "f21"
        },
        {
          "type": "tag",
          "name": "radar"
        },
        {
          "type": "tag",
          "name": "screenplay"
        },
        {
          "type": "tag",
          "name": "alternativo"
        },
        {
          "type": "tag",
          "name": "radar_vacio"
        }
      ],
      "activities": [
        {
          "name": "Dado que Alicia abre la aplicación e inicia sesión en la plataforma",
          "outcome": "SUCCESS",
          "duration": 3714,
          "children": [
            {
              "name": "Alicia inicia sesión con \"estudiante.screenplay.31326@example.com\"",
              "outcome": "SUCCESS",
              "duration": 3708,
              "children": [
                {
                  "name": "Alicia navigates to \"/login\"",
                  "outcome": "SUCCESS",
                  "duration": 555,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:07.372Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 18,
                    "column": 19
                  }
                },
                {
                  "name": "Alicia waits until campo de correo does become visible",
                  "outcome": "SUCCESS",
                  "duration": 52,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:07.927Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 18,
                    "column": 19
                  }
                },
                {
                  "name": "Alicia enters \"estudiante.screenplay.31326@example.com\" into campo de correo",
                  "outcome": "SUCCESS",
                  "duration": 8,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:07.979Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                    "line": 11,
                    "column": 27
                  }
                },
                {
                  "name": "Alicia enters [a masked value] into campo de contraseña",
                  "outcome": "SUCCESS",
                  "duration": 6,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:07.987Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                    "line": 12,
                    "column": 46
                  }
                },
                {
                  "name": "Alicia clicks on botón Log In",
                  "outcome": "SUCCESS",
                  "duration": 74,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:07.994Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                    "line": 13,
                    "column": 11
                  }
                },
                {
                  "name": "Alicia waits for 3s",
                  "outcome": "SUCCESS",
                  "duration": 3010,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:08.069Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 18,
                    "column": 19
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:07.372Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                "line": 18,
                "column": 19
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:07.366Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
            "line": 17
          }
        },
        {
          "name": "Cuando ella consulta el radar de entregas urgentes",
          "outcome": "SUCCESS",
          "duration": 345,
          "children": [
            {
              "name": "Alicia consulta el radar de entregas urgentes",
              "outcome": "SUCCESS",
              "duration": 339,
              "children": [
                {
                  "name": "Alicia navigates to \"/urgent-radar\"",
                  "outcome": "SUCCESS",
                  "duration": 292,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:11.086Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 24,
                    "column": 20
                  }
                },
                {
                  "name": "Alicia waits until título del radar de entregas urgentes does become visible",
                  "outcome": "SUCCESS",
                  "duration": 47,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:11.378Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 24,
                    "column": 20
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:11.086Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                "line": 24,
                "column": 20
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:11.081Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
            "line": 18
          }
        },
        {
          "name": "Entonces el radar muestra el mensaje \"No urgent assignments\"",
          "outcome": "SUCCESS",
          "duration": 195,
          "children": [
            {
              "name": "Alicia ensures that the text of título de radar vacío does equal \"No urgent assignments\"",
              "outcome": "SUCCESS",
              "duration": 190,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-10-25T01:19:11.430Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                "line": 42,
                "column": 12
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:11.426Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
            "line": 19
          }
        },
        {
          "name": "Y la descripción indica \"You have no pending assignments due within the next 24 hours.\"",
          "outcome": "SUCCESS",
          "duration": 10,
          "children": [
            {
              "name": "Alicia ensures that the text of descripción de radar vacío does equal \"You have no pending assignments due within the next 24 hours.\"",
              "outcome": "SUCCESS",
              "duration": 3,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-10-25T01:19:11.627Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                "line": 48,
                "column": 12
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:11.621Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
            "line": 20
          }
        },
        {
          "name": "After",
          "outcome": "SUCCESS",
          "duration": 10,
          "children": [],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:11.631Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/support/serenity.config.ts",
            "line": 39
          }
        }
      ],
      "executionHistory": [
        {
          "outcome": "SUCCESS",
          "run": "2026-10-25T01-16-18.365Z",
          "timestamp": "2026-10-25T01:16:04.167Z",
          "duration": 4421,
          "activities": [
            {
              "name": "Dado que Alicia abre la aplicación e inicia sesión en la plataforma",
              "outcome": "SUCCESS",
              "duration": 3731,
              "children": [
                {
                  "name": "Alicia inicia sesión con \"estudiante.screenplay.263617@example.com\"",
                  "outcome": "SUCCESS",
                  "duration": 3724,
                  "children": [
                    {
                      "name": "Alicia navigates to \"/login\"",
                      "outcome": "SUCCESS",
                      "duration": 558,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:09.542Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    },
                    {
                      "name": "Alicia waits until campo de correo does become visible",
                      "outcome": "SUCCESS",
                      "duration": 50,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:10.100Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    },
                    {
                      "name": "Alicia enters \"estudiante.screenplay.263617@example.com\" into campo de correo",
                      "outcome": "SUCCESS",
                      "duration": 8,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:10.151Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 11,
                        "column": 27
                      }
                    },
                    {
                      "name": "Alicia enters [a masked value] into campo de contraseña",
                      "outcome": "SUCCESS",
                      "duration": 17,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:10.159Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 12,
                        "column": 46
                      }
                    },
                    {
                      "name": "Alicia clicks on botón Log In",
                      "outcome": "SUCCESS",
                      "duration": 84,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:10.176Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 13,
                        "column": 11
                      }
                    },
                    {
                      "name": "Alicia waits for 3s",
                      "outcome": "SUCCESS",
                      "duration": 3005,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:10.261Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:16:09.542Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 18,
                    "column": 19
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:09.536Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 17
              }
            },
            {
              "name": "Cuando ella consulta el radar de entregas urgentes",
              "outcome": "SUCCESS",
              "duration": 479,
              "children": [
                {
                  "name": "Alicia consulta el radar de entregas urgentes",
                  "outcome": "SUCCESS",
                  "duration": 473,
                  "children": [
                    {
                      "name": "Alicia navigates to \"/urgent-radar\"",
                      "outcome": "SUCCESS",
                      "duration": 424,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:13.272Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 24,
                        "column": 20
                      }
                    },
                    {
                      "name": "Alicia waits until título del radar de entregas urgentes does become visible",
                      "outcome": "SUCCESS",
                      "duration": 49,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:13.696Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 24,
                        "column": 20
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:16:13.272Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 24,
                    "column": 20
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:13.267Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 18
              }
            },
            {
              "name": "Entonces el radar muestra el mensaje \"No urgent assignments\"",
              "outcome": "SUCCESS",
              "duration": 183,
              "children": [
                {
                  "name": "Alicia ensures that the text of título de radar vacío does equal \"No urgent assignments\"",
                  "outcome": "SUCCESS",
                  "duration": 180,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:16:13.749Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 42,
                    "column": 12
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:13.746Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 19
              }
            },
            {
              "name": "Y la descripción indica \"You have no pending assignments due within the next 24 hours.\"",
              "outcome": "SUCCESS",
              "duration": 9,
              "children": [
                {
                  "name": "Alicia ensures that the text of descripción de radar vacío does equal \"You have no pending assignments due within the next 24 hours.\"",
                  "outcome": "SUCCESS",
                  "duration": 3,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:16:13.935Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 48,
                    "column": 12
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:13.930Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 20
              }
            },
            {
              "name": "After",
              "outcome": "SUCCESS",
              "duration": 8,
              "children": [],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:13.939Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/support/serenity.config.ts",
                "line": 39
              }
            }
          ]
        },
        {
          "outcome": "SUCCESS",
          "run": "2026-10-25T01-19-16.444Z",
          "timestamp": "2026-10-25T01:19:02.258Z",
          "duration": 4288,
          "activities": [
            {
              "name": "Dado que Alicia abre la aplicación e inicia sesión en la plataforma",
              "outcome": "SUCCESS",
              "duration": 3714,
              "children": [
                {
                  "name": "Alicia inicia sesión con \"estudiante.screenplay.31326@example.com\"",
                  "outcome": "SUCCESS",
                  "duration": 3708,
                  "children": [
                    {
                      "name": "Alicia navigates to \"/login\"",
                      "outcome": "SUCCESS",
                      "duration": 555,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:07.372Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    },
                    {
                      "name": "Alicia waits until campo de correo does become visible",
                      "outcome": "SUCCESS",
                      "duration": 52,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:07.927Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    },
                    {
                      "name": "Alicia enters \"estudiante.screenplay.31326@example.com\" into campo de correo",
                      "outcome": "SUCCESS",
                      "duration": 8,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:07.979Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 11,
                        "column": 27
                      }
                    },
                    {
                      "name": "Alicia enters [a masked value] into campo de contraseña",
                      "outcome": "SUCCESS",
                      "duration": 6,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:07.987Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 12,
                        "column": 46
                      }
                    },
                    {
                      "name": "Alicia clicks on botón Log In",
                      "outcome": "SUCCESS",
                      "duration": 74,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:07.994Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 13,
                        "column": 11
                      }
                    },
                    {
                      "name": "Alicia waits for 3s",
                      "outcome": "SUCCESS",
                      "duration": 3010,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:08.069Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:19:07.372Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 18,
                    "column": 19
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:07.366Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 17
              }
            },
            {
              "name": "Cuando ella consulta el radar de entregas urgentes",
              "outcome": "SUCCESS",
              "duration": 345,
              "children": [
                {
                  "name": "Alicia consulta el radar de entregas urgentes",
                  "outcome": "SUCCESS",
                  "duration": 339,
                  "children": [
                    {
                      "name": "Alicia navigates to \"/urgent-radar\"",
                      "outcome": "SUCCESS",
                      "duration": 292,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:11.086Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 24,
                        "column": 20
                      }
                    },
                    {
                      "name": "Alicia waits until título del radar de entregas urgentes does become visible",
                      "outcome": "SUCCESS",
                      "duration": 47,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:11.378Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 24,
                        "column": 20
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:19:11.086Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 24,
                    "column": 20
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:11.081Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 18
              }
            },
            {
              "name": "Entonces el radar muestra el mensaje \"No urgent assignments\"",
              "outcome": "SUCCESS",
              "duration": 195,
              "children": [
                {
                  "name": "Alicia ensures that the text of título de radar vacío does equal \"No urgent assignments\"",
                  "outcome": "SUCCESS",
                  "duration": 190,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:11.430Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 42,
                    "column": 12
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:11.426Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 19
              }
            },
            {
              "name": "Y la descripción indica \"You have no pending assignments due within the next 24 hours.\"",
              "outcome": "SUCCESS",
              "duration": 10,
              "children": [
                {
                  "name": "Alicia ensures that the text of descripción de radar vacío does equal \"You have no pending assignments due within the next 24 hours.\"",
                  "outcome": "SUCCESS",
                  "duration": 3,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:11.627Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 48,
                    "column": 12
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:11.621Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 20
              }
            },
            {
              "name": "After",
              "outcome": "SUCCESS",
              "duration": 10,
              "children": [],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:11.631Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/support/serenity.config.ts",
                "line": 39
              }
            }
          ]
        }
      ],
      "narrative": "<p>Como estudiante universitario\nQuiero monitorear mis entregas urgentes en una vista dedicada\nPara priorizar mis compromisos académicos de las próximas 24 horas</p>\n",
      "cast": [
        {
          "name": "Alicia",
          "abilities": [
            {
              "name": "PerformActivities"
            },
            {
              "name": "AnswerQuestions"
            },
            {
              "name": "RaiseErrors"
            },
            {
              "name": "ScheduleWork",
              "details": "{\"scheduler\":{\"clock\":{\"timeAdjustment\":{\"milliseconds\":0}},\"interactionTimeout\":{\"milliseconds\":5000}}}"
            },
            {
              "name": "CallAnApi",
              "details": "{\"baseURL\":\"https://whatsduetomorrow-backed.onrender.com\",\"headers\":{\"common\":{\"Accept\":\"application/json, text/plain, */*\"}},\"timeout\":10000}"
            },
            {
              "name": "BrowseTheWebWithPlaywright"
            }
          ]
        }
      ],
      "id": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature:16"
    },
    {
      "name": "Solicitud de activación de alertas web en el radar",
      "category": "F21 - Alertas y radar de entregas urgentes",
      "outcome": "SUCCESS",
      "duration": 4596,
      "startedAt": "2026-10-25T01:19:11.655Z",
      "source": {
        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
        "line": 23
      },
      "tags": [
        {
          "type": "feature",
          "name": "F21 - Alertas y radar de entregas urgentes"
        },
        {
          "type": "tag",
          "name": "f21"
        },
        {
          "type": "tag",
          "name": "radar"
        },
        {
          "type": "tag",
          "name": "screenplay"
        },
        {
          "type": "tag",
          "name": "alternativo"
        },
        {
          "type": "tag",
          "name": "alertas"
        }
      ],
      "activities": [
        {
          "name": "Dado que Alicia abre la aplicación e inicia sesión en la plataforma",
          "outcome": "SUCCESS",
          "duration": 4119,
          "children": [
            {
              "name": "Alicia inicia sesión con \"estudiante.screenplay.31326@example.com\"",
              "outcome": "SUCCESS",
              "duration": 4112,
              "children": [
                {
                  "name": "Alicia navigates to \"/login\"",
                  "outcome": "SUCCESS",
                  "duration": 962,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:11.662Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 18,
                    "column": 19
                  }
                },
                {
                  "name": "Alicia waits until campo de correo does become visible",
                  "outcome": "SUCCESS",
                  "duration": 50,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:12.624Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 18,
                    "column": 19
                  }
                },
                {
                  "name": "Alicia enters \"estudiante.screenplay.31326@example.com\" into campo de correo",
                  "outcome": "SUCCESS",
                  "duration": 8,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:12.674Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                    "line": 11,
                    "column": 27
                  }
                },
                {
                  "name": "Alicia enters [a masked value] into campo de contraseña",
                  "outcome": "SUCCESS",
                  "duration": 7,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:12.682Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                    "line": 12,
                    "column": 46
                  }
                },
                {
                  "name": "Alicia clicks on botón Log In",
                  "outcome": "SUCCESS",
                  "duration": 80,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:12.689Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                    "line": 13,
                    "column": 11
                  }
                },
                {
                  "name": "Alicia waits for 3s",
                  "outcome": "SUCCESS",
                  "duration": 3005,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:12.769Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 18,
                    "column": 19
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:11.662Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                "line": 18,
                "column": 19
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:11.656Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
            "line": 24
          }
        },
        {
          "name": "Cuando ella consulta el radar de entregas urgentes",
          "outcome": "SUCCESS",
          "duration": 345,
          "children": [
            {
              "name": "Alicia consulta el radar de entregas urgentes",
              "outcome": "SUCCESS",
              "duration": 339,
              "children": [
                {
                  "name": "Alicia navigates to \"/urgent-radar\"",
                  "outcome": "SUCCESS",
                  "duration": 292,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:15.781Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 24,
                    "column": 20
                  }
                },
                {
                  "name": "Alicia waits until título del radar de entregas urgentes does become visible",
                  "outcome": "SUCCESS",
                  "duration": 46,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:16.074Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 24,
                    "column": 20
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:15.781Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                "line": 24,
                "column": 20
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:15.775Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
            "line": 25
          }
        },
        {
          "name": "Y ella activa las alertas web en el radar",
          "outcome": "SUCCESS",
          "duration": 93,
          "children": [
            {
              "name": "Alicia activa las alertas web en el radar",
              "outcome": "SUCCESS",
              "duration": 85,
              "children": [
                {
                  "name": "Alicia waits until botón habilitar alertas web does become visible",
                  "outcome": "SUCCESS",
                  "duration": 23,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:16.127Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 54,
                    "column": 23
                  }
                },
                {
                  "name": "Alicia clicks on botón habilitar alertas web",
                  "outcome": "SUCCESS",
                  "duration": 62,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:16.150Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/ActivarAlertasWeb.ts",
                    "line": 10,
                    "column": 11
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:16.127Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                "line": 54,
                "column": 23
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:16.120Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
            "line": 26
          }
        },
        {
          "name": "Entonces el sistema despliega una notificación sobre las alertas web",
          "outcome": "SUCCESS",
          "duration": 12,
          "children": [
            {
              "name": "Alicia ensures that the text of mensaje de notificación de alerta does not equal \"\"",
              "outcome": "SUCCESS",
              "duration": 7,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-10-25T01:19:16.218Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                "line": 60,
                "column": 12
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:16.213Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
            "line": 27
          }
        },
        {
          "name": "After",
          "outcome": "SUCCESS",
          "duration": 14,
          "children": [],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:16.226Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/support/serenity.config.ts",
            "line": 39
          }
        }
      ],
      "executionHistory": [
        {
          "outcome": "SUCCESS",
          "run": "2026-10-25T01-16-18.365Z",
          "timestamp": "2026-10-25T01:16:04.167Z",
          "duration": 4209,
          "activities": [
            {
              "name": "Dado que Alicia abre la aplicación e inicia sesión en la plataforma",
              "outcome": "SUCCESS",
              "duration": 3724,
              "children": [
                {
                  "name": "Alicia inicia sesión con \"estudiante.screenplay.263617@example.com\"",
                  "outcome": "SUCCESS",
                  "duration": 3717,
                  "children": [
                    {
                      "name": "Alicia navigates to \"/login\"",
                      "outcome": "SUCCESS",
                      "duration": 571,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:13.967Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    },
                    {
                      "name": "Alicia waits until campo de correo does become visible",
                      "outcome": "SUCCESS",
                      "duration": 51,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:14.539Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    },
                    {
                      "name": "Alicia enters \"estudiante.screenplay.263617@example.com\" into campo de correo",
                      "outcome": "SUCCESS",
                      "duration": 8,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:14.591Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 11,
                        "column": 27
                      }
                    },
                    {
                      "name": "Alicia enters [a masked value] into campo de contraseña",
                      "outcome": "SUCCESS",
                      "duration": 5,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:14.599Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 12,
                        "column": 46
                      }
                    },
                    {
                      "name": "Alicia clicks on botón Log In",
                      "outcome": "SUCCESS",
                      "duration": 70,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:14.605Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 13,
                        "column": 11
                      }
                    },
                    {
                      "name": "Alicia waits for 3s",
                      "outcome": "SUCCESS",
                      "duration": 3008,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:14.676Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:16:13.967Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 18,
                    "column": 19
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:13.961Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 24
              }
            },
            {
              "name": "Cuando ella consulta el radar de entregas urgentes",
              "outcome": "SUCCESS",
              "duration": 353,
              "children": [
                {
                  "name": "Alicia consulta el radar de entregas urgentes",
                  "outcome": "SUCCESS",
                  "duration": 347,
                  "children": [
                    {
                      "name": "Alicia navigates to \"/urgent-radar\"",
                      "outcome": "SUCCESS",
                      "duration": 302,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:17.690Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 24,
                        "column": 20
                      }
                    },
                    {
                      "name": "Alicia waits until título del radar de entregas urgentes does become visible",
                      "outcome": "SUCCESS",
                      "duration": 45,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:17.992Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 24,
                        "column": 20
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:16:17.690Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 24,
                    "column": 20
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:17.685Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 25
              }
            },
            {
              "name": "Y ella activa las alertas web en el radar",
              "outcome": "SUCCESS",
              "duration": 99,
              "children": [
                {
                  "name": "Alicia activa las alertas web en el radar",
                  "outcome": "SUCCESS",
                  "duration": 94,
                  "children": [
                    {
                      "name": "Alicia waits until botón habilitar alertas web does become visible",
                      "outcome": "SUCCESS",
                      "duration": 24,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:18.043Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 54,
                        "column": 23
                      }
                    },
                    {
                      "name": "Alicia clicks on botón habilitar alertas web",
                      "outcome": "SUCCESS",
                      "duration": 70,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:18.067Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/ActivarAlertasWeb.ts",
                        "line": 10,
                        "column": 11
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:16:18.043Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 54,
                    "column": 23
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:18.038Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 26
              }
            },
            {
              "name": "Entonces el sistema despliega una notificación sobre las alertas web",
              "outcome": "SUCCESS",
              "duration": 12,
              "children": [
                {
                  "name": "Alicia ensures that the text of mensaje de notificación de alerta does not equal \"\"",
                  "outcome": "SUCCESS",
                  "duration": 6,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:16:18.143Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 60,
                    "column": 12
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:18.138Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 27
              }
            },
            {
              "name": "After",
              "outcome": "SUCCESS",
              "duration": 7,
              "children": [],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:18.150Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/support/serenity.config.ts",
                "line": 39
              }
            }
          ]
        },
        {
          "outcome": "SUCCESS",
          "run": "2026-10-25T01-19-16.444Z",
          "timestamp": "2026-10-25T01:19:02.258Z",
          "duration": 4596,
          "activities": [
            {
              "name": "Dado que Alicia abre la aplicación e inicia sesión en la plataforma",
              "outcome": "SUCCESS",
              "duration": 4119,
              "children": [
                {
                  "name": "Alicia inicia sesión con \"estudiante.screenplay.31326@example.com\"",
                  "outcome": "SUCCESS",
                  "duration": 4112,
                  "children": [
                    {
                      "name": "Alicia navigates to \"/login\"",
                      "outcome": "SUCCESS",
                      "duration": 962,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:11.662Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    },
                    {
                      "name": "Alicia waits until campo de correo does become visible",
                      "outcome": "SUCCESS",
                      "duration": 50,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:12.624Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    },
                    {
                      "name": "Alicia enters \"estudiante.screenplay.31326@example.com\" into campo de correo",
                      "outcome": "SUCCESS",
                      "duration": 8,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:12.674Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 11,
                        "column": 27
                      }
                    },
                    {
                      "name": "Alicia enters [a masked value] into campo de contraseña",
                      "outcome": "SUCCESS",
                      "duration": 7,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:12.682Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 12,
                        "column": 46
                      }
                    },
                    {
                      "name": "Alicia clicks on botón Log In",
                      "outcome": "SUCCESS",
                      "duration": 80,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:12.689Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/IniciarSesion.ts",
                        "line": 13,
                        "column": 11
                      }
                    },
                    {
                      "name": "Alicia waits for 3s",
                      "outcome": "SUCCESS",
                      "duration": 3005,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:12.769Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 18,
                        "column": 19
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:19:11.662Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 18,
                    "column": 19
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:11.656Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 24
              }
            },
            {
              "name": "Cuando ella consulta el radar de entregas urgentes",
              "outcome": "SUCCESS",
              "duration": 345,
              "children": [
                {
                  "name": "Alicia consulta el radar de entregas urgentes",
                  "outcome": "SUCCESS",
                  "duration": 339,
                  "children": [
                    {
                      "name": "Alicia navigates to \"/urgent-radar\"",
                      "outcome": "SUCCESS",
                      "duration": 292,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:15.781Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 24,
                        "column": 20
                      }
                    },
                    {
                      "name": "Alicia waits until título del radar de entregas urgentes does become visible",
                      "outcome": "SUCCESS",
                      "duration": 46,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:16.074Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 24,
                        "column": 20
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:19:15.781Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 24,
                    "column": 20
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:15.775Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 25
              }
            },
            {
              "name": "Y ella activa las alertas web en el radar",
              "outcome": "SUCCESS",
              "duration": 93,
              "children": [
                {
                  "name": "Alicia activa las alertas web en el radar",
                  "outcome": "SUCCESS",
                  "duration": 85,
                  "children": [
                    {
                      "name": "Alicia waits until botón habilitar alertas web does become visible",
                      "outcome": "SUCCESS",
                      "duration": 23,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:16.127Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 54,
                        "column": 23
                      }
                    },
                    {
                      "name": "Alicia clicks on botón habilitar alertas web",
                      "outcome": "SUCCESS",
                      "duration": 62,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:16.150Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/test/tasks/ActivarAlertasWeb.ts",
                        "line": 10,
                        "column": 11
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:19:16.127Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 54,
                    "column": 23
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:16.120Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 26
              }
            },
            {
              "name": "Entonces el sistema despliega una notificación sobre las alertas web",
              "outcome": "SUCCESS",
              "duration": 12,
              "children": [
                {
                  "name": "Alicia ensures that the text of mensaje de notificación de alerta does not equal \"\"",
                  "outcome": "SUCCESS",
                  "duration": 7,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:16.218Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 60,
                    "column": 12
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:16.213Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 27
              }
            },
            {
              "name": "After",
              "outcome": "SUCCESS",
              "duration": 14,
              "children": [],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:16.226Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/support/serenity.config.ts",
                "line": 39
              }
            }
          ]
        }
      ],
      "narrative": "<p>Como estudiante universitario\nQuiero monitorear mis entregas urgentes en una vista dedicada\nPara priorizar mis compromisos académicos de las próximas 24 horas</p>\n",
      "cast": [
        {
          "name": "Alicia",
          "abilities": [
            {
              "name": "PerformActivities"
            },
            {
              "name": "AnswerQuestions"
            },
            {
              "name": "RaiseErrors"
            },
            {
              "name": "ScheduleWork",
              "details": "{\"scheduler\":{\"clock\":{\"timeAdjustment\":{\"milliseconds\":0}},\"interactionTimeout\":{\"milliseconds\":5000}}}"
            },
            {
              "name": "CallAnApi",
              "details": "{\"baseURL\":\"https://whatsduetomorrow-backed.onrender.com\",\"headers\":{\"common\":{\"Accept\":\"application/json, text/plain, */*\"}},\"timeout\":10000}"
            },
            {
              "name": "BrowseTheWebWithPlaywright"
            }
          ]
        }
      ],
      "id": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature:23"
    },
    {
      "name": "Denegación de acceso no autenticado al endpoint del radar",
      "category": "F21 - Alertas y radar de entregas urgentes",
      "outcome": "SUCCESS",
      "duration": 208,
      "startedAt": "2026-10-25T01:19:16.254Z",
      "source": {
        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
        "line": 30
      },
      "tags": [
        {
          "type": "feature",
          "name": "F21 - Alertas y radar de entregas urgentes"
        },
        {
          "type": "tag",
          "name": "f21"
        },
        {
          "type": "tag",
          "name": "radar"
        },
        {
          "type": "tag",
          "name": "screenplay"
        },
        {
          "type": "tag",
          "name": "api"
        },
        {
          "type": "tag",
          "name": "seguridad"
        },
        {
          "type": "tag",
          "name": "error"
        }
      ],
      "activities": [
        {
          "name": "Cuando el actor Api solicita las entregas urgentes sin token de autorización",
          "outcome": "SUCCESS",
          "duration": 192,
          "children": [
            {
              "name": "Api consulta las entregas urgentes sin token de autorización",
              "outcome": "SUCCESS",
              "duration": 188,
              "children": [
                {
                  "name": "Api sends a GET request to '/assignments/upcoming'",
                  "outcome": "SUCCESS",
                  "duration": 188,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:16.257Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 66,
                    "column": 34
                  },
                  "artifacts": [
                    {
                      "path": "test-runs/2026-10-25T01-19-16.444Z/artifact-get-https---whatsduetomorrow-backed-onrender-com-assignments-upc-469ef8a578.json",
                      "type": "screenshot"
                    }
                  ],
                  "restQuery": {
                    "method": "GET",
                    "url": "https://whatsduetomorrow-backed.onrender.com/assignments/upcoming",
                    "requestHeaders": "Accept: application/json, text/plain, */*\nUser-Agent: axios/1.20.0\nAccept-Encoding: gzip, compress, deflate, br",
                    "statusCode": 401,
                    "responseHeaders": "date: Sun, 25 Oct 2026 01:19:16 GMT\ncontent-type: application/json; charset=utf-8\ncontent-length: 47\nconnection: close\naccess-control-allow-credentials: true\netag: W/\"2b-dGnJzt6gv1nJjX6DJ9RztDWptng\"\nrndr-id: 9699485b-9dd4-4a23\nserver: cloudflare\nvary: Origin, Accept-Encoding\nx-powered-by: Express\nx-render-origin-server: Render\ncf-cache-status: DYNAMIC\ncf-ray: a4fd645f19171381-BOG\nalt-svc: h3=\":443\"; ma=86400",
                    "responseBody": "{\n    \"message\": \"Unauthorized\",\n    \"statusCode\": 401\n}"
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:16.257Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                "line": 66,
                "column": 34
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:16.254Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
            "line": 31
          }
        },
        {
          "name": "Entonces la respuesta HTTP del servidor tiene código 401",
          "outcome": "SUCCESS",
          "duration": 4,
          "children": [
            {
              "name": "Api ensures that the status of the last response does equal 401",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-10-25T01:19:16.449Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                "line": 72,
                "column": 12
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:16.446Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
            "line": 32
          }
        },
        {
          "name": "After",
          "outcome": "SUCCESS",
          "duration": 1,
          "children": [],
          "type": "Task",
          "startedAt": "2026-10-25T01:19:16.450Z",
          "location": {
            "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/support/serenity.config.ts",
            "line": 39
          }
        }
      ],
      "executionHistory": [
        {
          "outcome": "SUCCESS",
          "run": "2026-10-25T01-16-18.365Z",
          "timestamp": "2026-10-25T01:16:04.167Z",
          "duration": 212,
          "activities": [
            {
              "name": "Cuando el actor Api solicita las entregas urgentes sin token de autorización",
              "outcome": "SUCCESS",
              "duration": 195,
              "children": [
                {
                  "name": "Api consulta las entregas urgentes sin token de autorización",
                  "outcome": "SUCCESS",
                  "duration": 192,
                  "children": [
                    {
                      "name": "Api sends a GET request to '/assignments/upcoming'",
                      "outcome": "SUCCESS",
                      "duration": 192,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:16:18.174Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 66,
                        "column": 34
                      },
                      "artifacts": [
                        {
                          "path": "test-runs/2026-10-25T01-16-18.365Z/artifact-get-https---whatsduetomorrow-backed-onrender-com-assignments-upc-08add5781d.json",
                          "type": "screenshot"
                        }
                      ],
                      "restQuery": {
                        "method": "GET",
                        "url": "https://whatsduetomorrow-backed.onrender.com/assignments/upcoming",
                        "requestHeaders": "Accept: application/json, text/plain, */*\nUser-Agent: axios/1.20.0\nAccept-Encoding: gzip, compress, deflate, br",
                        "statusCode": 401,
                        "responseHeaders": "date: Sun, 25 Oct 2026 01:16:18 GMT\ncontent-type: application/json; charset=utf-8\ncontent-length: 47\nconnection: close\naccess-control-allow-credentials: true\netag: W/\"2b-dGnJzt6gv1nJjX6DJ9RztDWptng\"\nrndr-id: c0ccc36d-2031-4828\nserver: cloudflare\nvary: Origin, Accept-Encoding\nx-powered-by: Express\nx-render-origin-server: Render\ncf-cache-status: DYNAMIC\ncf-ray: a4fd60061aaf7edd-BOG\nalt-svc: h3=\":443\"; ma=86400",
                        "responseBody": "{\n    \"message\": \"Unauthorized\",\n    \"statusCode\": 401\n}"
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:16:18.174Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 66,
                    "column": 34
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:18.171Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 31
              }
            },
            {
              "name": "Entonces la respuesta HTTP del servidor tiene código 401",
              "outcome": "SUCCESS",
              "duration": 5,
              "children": [
                {
                  "name": "Api ensures that the status of the last response does equal 401",
                  "outcome": "SUCCESS",
                  "duration": 1,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:16:18.369Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 72,
                    "column": 12
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:18.366Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 32
              }
            },
            {
              "name": "After",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Task",
              "startedAt": "2026-10-25T01:16:18.371Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/support/serenity.config.ts",
                "line": 39
              }
            }
          ]
        },
        {
          "outcome": "SUCCESS",
          "run": "2026-10-25T01-19-16.444Z",
          "timestamp": "2026-10-25T01:19:02.258Z",
          "duration": 208,
          "activities": [
            {
              "name": "Cuando el actor Api solicita las entregas urgentes sin token de autorización",
              "outcome": "SUCCESS",
              "duration": 192,
              "children": [
                {
                  "name": "Api consulta las entregas urgentes sin token de autorización",
                  "outcome": "SUCCESS",
                  "duration": 188,
                  "children": [
                    {
                      "name": "Api sends a GET request to '/assignments/upcoming'",
                      "outcome": "SUCCESS",
                      "duration": 188,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-10-25T01:19:16.257Z",
                      "location": {
                        "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                        "line": 66,
                        "column": 34
                      },
                      "artifacts": [
                        {
                          "path": "test-runs/2026-10-25T01-19-16.444Z/artifact-get-https---whatsduetomorrow-backed-onrender-com-assignments-upc-469ef8a578.json",
                          "type": "screenshot"
                        }
                      ],
                      "restQuery": {
                        "method": "GET",
                        "url": "https://whatsduetomorrow-backed.onrender.com/assignments/upcoming",
                        "requestHeaders": "Accept: application/json, text/plain, */*\nUser-Agent: axios/1.20.0\nAccept-Encoding: gzip, compress, deflate, br",
                        "statusCode": 401,
                        "responseHeaders": "date: Sun, 25 Oct 2026 01:19:16 GMT\ncontent-type: application/json; charset=utf-8\ncontent-length: 47\nconnection: close\naccess-control-allow-credentials: true\netag: W/\"2b-dGnJzt6gv1nJjX6DJ9RztDWptng\"\nrndr-id: 9699485b-9dd4-4a23\nserver: cloudflare\nvary: Origin, Accept-Encoding\nx-powered-by: Express\nx-render-origin-server: Render\ncf-cache-status: DYNAMIC\ncf-ray: a4fd645f19171381-BOG\nalt-svc: h3=\":443\"; ma=86400",
                        "responseBody": "{\n    \"message\": \"Unauthorized\",\n    \"statusCode\": 401\n}"
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-10-25T01:19:16.257Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 66,
                    "column": 34
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:16.254Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 31
              }
            },
            {
              "name": "Entonces la respuesta HTTP del servidor tiene código 401",
              "outcome": "SUCCESS",
              "duration": 4,
              "children": [
                {
                  "name": "Api ensures that the status of the last response does equal 401",
                  "outcome": "SUCCESS",
                  "duration": 1,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-10-25T01:19:16.449Z",
                  "location": {
                    "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/step-definitions/f21_radar.steps.ts",
                    "line": 72,
                    "column": 12
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:16.446Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature",
                "line": 32
              }
            },
            {
              "name": "After",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Task",
              "startedAt": "2026-10-25T01:19:16.450Z",
              "location": {
                "path": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/support/serenity.config.ts",
                "line": 39
              }
            }
          ]
        }
      ],
      "narrative": "<p>Como estudiante universitario\nQuiero monitorear mis entregas urgentes en una vista dedicada\nPara priorizar mis compromisos académicos de las próximas 24 horas</p>\n",
      "cast": [
        {
          "name": "Api",
          "abilities": [
            {
              "name": "PerformActivities"
            },
            {
              "name": "AnswerQuestions"
            },
            {
              "name": "RaiseErrors"
            },
            {
              "name": "ScheduleWork",
              "details": "{\"scheduler\":{\"clock\":{\"timeAdjustment\":{\"milliseconds\":0}},\"interactionTimeout\":{\"milliseconds\":5000}}}"
            },
            {
              "name": "CallAnApi",
              "details": "{\"baseURL\":\"https://whatsduetomorrow-backed.onrender.com\",\"headers\":{\"common\":{\"Accept\":\"application/json, text/plain, */*\"}},\"timeout\":10000}"
            },
            {
              "name": "BrowseTheWebWithPlaywright"
            }
          ]
        }
      ],
      "id": "/home/dsanabriag/Universidad/VyV/proyecto-aula/repositorios/WhatsDueTomorrow-Backed/tests-bdd/features/f21_radar_entregas.feature:30"
    }
  ],
  "history": [
    {
      "timestamp": "2026-10-25T01:16:04.167Z",
      "duration": 128682,
      "outcomes": {
        "passed": 24,
        "failed": 0,
        "pending": 0,
        "skipped": 0,
        "compromised": 0,
        "error": 0
      },
      "label": "2026-10-25T01-16-18.365Z",
      "slowest": 11533,
      "fastest": 212,
      "average": 5359,
      "commit": "255da29",
      "branch": "main",
      "repositoryUrl": "https://github.com/NicolasBernal1/WhatsDueTomorrow-Backed.git",
      "score": {
        "confidence": 100,
        "passRate": 100,
        "consistency": 100,
        "completeness": 100
      }
    },
    {
      "timestamp": "2026-10-25T01:19:02.258Z",
      "duration": 14204,
      "outcomes": {
        "passed": 4,
        "failed": 0,
        "pending": 0,
        "skipped": 0,
        "compromised": 0,
        "error": 0
      },
      "label": "2026-10-25T01-19-16.444Z",
      "slowest": 5103,
      "fastest": 208,
      "average": 3549,
      "commit": "255da29",
      "branch": "main",
      "repositoryUrl": "https://github.com/NicolasBernal1/WhatsDueTomorrow-Backed.git",
      "score": {
        "confidence": 100,
        "passRate": 100,
        "consistency": 100,
        "completeness": 100
      }
    }
  ],
  "tags": [
    {
      "type": "feature",
      "name": "F21 - Alertas y radar de entregas urgentes",
      "scenarioCount": 4,
      "passed": 4,
      "failed": 0,
      "skipped": 0
    },
    {
      "type": "tag",
      "name": "f21",
      "scenarioCount": 4,
      "passed": 4,
      "failed": 0,
      "skipped": 0
    },
    {
      "type": "tag",
      "name": "radar",
      "scenarioCount": 4,
      "passed": 4,
      "failed": 0,
      "skipped": 0
    },
    {
      "type": "tag",
      "name": "screenplay",
      "scenarioCount": 4,
      "passed": 4,
      "failed": 0,
      "skipped": 0
    },
    {
      "type": "tag",
      "name": "smoke",
      "scenarioCount": 1,
      "passed": 1,
      "failed": 0,
      "skipped": 0
    },
    {
      "type": "tag",
      "name": "exitoso",
      "scenarioCount": 1,
      "passed": 1,
      "failed": 0,
      "skipped": 0
    },
    {
      "type": "tag",
      "name": "alternativo",
      "scenarioCount": 2,
      "passed": 2,
      "failed": 0,
      "skipped": 0
    },
    {
      "type": "tag",
      "name": "radar_vacio",
      "scenarioCount": 1,
      "passed": 1,
      "failed": 0,
      "skipped": 0
    },
    {
      "type": "tag",
      "name": "alertas",
      "scenarioCount": 1,
      "passed": 1,
      "failed": 0,
      "skipped": 0
    },
    {
      "type": "tag",
      "name": "api",
      "scenarioCount": 1,
      "passed": 1,
      "failed": 0,
      "skipped": 0
    },
    {
      "type": "tag",
      "name": "seguridad",
      "scenarioCount": 1,
      "passed": 1,
      "failed": 0,
      "skipped": 0
    },
    {
      "type": "tag",
      "name": "error",
      "scenarioCount": 1,
      "passed": 1,
      "failed": 0,
      "skipped": 0
    }
  ],
  "inconsistentTests": [],
  "newFailures": [],
  "newPasses": [],
  "systemContext": {
    "nodeVersion": "v24.18.0",
    "os": {
      "name": "linux",
      "version": "7.2.11-200.fc44.x86_64",
      "arch": "x64"
    },
    "serenityVersion": "3.49.0",
    "testRunner": {
      "name": "Cucumber",
      "version": "13.3.0"
    },
    "browsers": [],
    "ci": {
      "provider": "localhost (fedora)",
      "buildNumber": "2026-10-25 01:19",
      "branch": "main",
      "commit": "255da29",
      "commitMessage": "Added Cypress tests",
      "commitAuthor": "dsanabria174",
      "repositoryUrl": "https://github.com/NicolasBernal1/WhatsDueTomorrow-Backed.git"
    },
    "projectName": "whats-due-tomorrow-bdd",
    "packageManager": "npm"
  },
  "capabilities": {
    "type": "directory",
    "name": "features",
    "outcomes": {
      "passed": 4,
      "failed": 0,
      "pending": 0,
      "skipped": 0,
      "compromised": 0,
      "error": 0
    },
    "scenarioCount": 4,
    "children": [
      {
        "type": "file",
        "name": "f21_radar_entregas",
        "outcomes": {
          "passed": 4,
          "failed": 0,
          "pending": 0,
          "skipped": 0,
          "compromised": 0,
          "error": 0
        },
        "scenarioCount": 4,
        "scenarios": [
          {
            "name": "Visualización de la vista del radar de entregas urgentes",
            "outcome": "SUCCESS",
            "executionHistory": [
              "SUCCESS",
              "SUCCESS"
            ]
          },
          {
            "name": "Radar despejado cuando no existen entregas urgentes",
            "outcome": "SUCCESS",
            "executionHistory": [
              "SUCCESS",
              "SUCCESS"
            ]
          },
          {
            "name": "Solicitud de activación de alertas web en el radar",
            "outcome": "SUCCESS",
            "executionHistory": [
              "SUCCESS",
              "SUCCESS"
            ]
          },
          {
            "name": "Denegación de acceso no autenticado al endpoint del radar",
            "outcome": "SUCCESS",
            "executionHistory": [
              "SUCCESS",
              "SUCCESS"
            ]
          }
        ],
        "narrative": "Como estudiante universitario\nQuiero monitorear mis entregas urgentes en una vista dedicada\nPara priorizar mis compromisos académicos de las próximas 24 horas",
        "score": {
          "confidence": 100,
          "passRate": 100,
          "completeness": 100,
          "consistency": 100
        }
      }
    ],
    "score": {
      "confidence": 100,
      "passRate": 100,
      "completeness": 100,
      "consistency": 100
    }
  },
  "specDirectory": "features"
};
