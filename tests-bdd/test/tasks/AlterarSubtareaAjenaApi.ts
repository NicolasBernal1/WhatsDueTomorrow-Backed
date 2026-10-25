import { Task } from '@serenity-js/core';
import { PatchRequest, Send } from '@serenity-js/rest';

export const AlterarSubtareaAjenaApi = {
  marcarCompletada: (assignmentId: number, subtaskId: number, token: string) => Task.where(
    `#actor intenta modificar indebidamente la subtarea #${subtaskId} de la entrega #${assignmentId}`,
    Send.a(
      PatchRequest.to(`/assignments/${assignmentId}/subtasks/${subtaskId}`)
        .with({ completed: true })
        .using({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
    ),
  ),
};
