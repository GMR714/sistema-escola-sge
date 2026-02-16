import { ActionIcon, Button, Group, Modal, Select, Table, Text, Textarea, TextInput, Title } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { api } from '../api/client';
import { notifications } from '@mantine/notifications';

interface Turma {
    id: number;
    nome: string;
}

interface PlanoAula {
    id: number;
    turma_id: number;
    data: string;
    conteudo: string;
    metodologia: string;
    tarefa_casa: string;
}

export default function LessonPlan() {
    const [turmaId, setTurmaId] = useState<string | null>(null);
    const [opened, { open, close }] = useDisclosure(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const queryClient = useQueryClient();

    const form = useForm({
        initialValues: {
            data: new Date(),
            conteudo: '',
            metodologia: '',
            tarefa_casa: ''
        },
        validate: {
            conteudo: (value) => (value.length < 5 ? 'Conteúdo muito curto' : null),
        },
    });

    const { data: turmas } = useQuery({
        queryKey: ['turmas'],
        queryFn: async () => (await api.get<Turma[]>('/academic/turmas')).data
    });

    const { data: planos } = useQuery({
        queryKey: ['planos', turmaId],
        queryFn: async () => {
            if (!turmaId) return [];
            return (await api.get<PlanoAula[]>(`/diary/turmas/${turmaId}/planos`)).data;
        },
        enabled: !!turmaId
    });

    const mutation = useMutation({
        mutationFn: async (values: typeof form.values) => {
            const payload = {
                turma_id: Number(turmaId),
                data: values.data.toISOString().split('T')[0],
                conteudo: values.conteudo,
                metodologia: values.metodologia,
                tarefa_casa: values.tarefa_casa
            };

            if (editingId) {
                return api.put(`/diary/planos/${editingId}`, payload);
            } else {
                return api.post('/diary/planos', payload);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planos', turmaId] });
            close();
            form.reset();
            setEditingId(null);
            notifications.show({ title: 'Sucesso', message: 'Plano salvo!', color: 'green' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => api.delete(`/diary/planos/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planos', turmaId] });
            notifications.show({ title: 'Sucesso', message: 'Plano removido!', color: 'green' });
        }
    });

    const handleEdit = (plano: PlanoAula) => {
        setEditingId(plano.id);
        form.setValues({
            data: new Date(plano.data),
            conteudo: plano.conteudo,
            metodologia: plano.metodologia || '',
            tarefa_casa: plano.tarefa_casa || ''
        });
        open();
    };

    const handleNew = () => {
        setEditingId(null);
        form.reset();
        open();
    };

    return (
        <>
            <Title order={2} mb="lg">Planejamento de Aulas</Title>

            <Select
                label="Selecione a Turma"
                placeholder="Turma"
                data={turmas?.map(t => ({ value: String(t.id), label: t.nome })) || []}
                value={turmaId}
                onChange={setTurmaId}
                mb="lg"
            />

            {turmaId && (
                <>
                    <Button leftSection={<IconPlus size={16} />} onClick={handleNew} mb="md">Novo Plano</Button>

                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Data</Table.Th>
                                <Table.Th>Conteúdo</Table.Th>
                                <Table.Th>Metodologia</Table.Th>
                                <Table.Th>Tarefa de Casa</Table.Th>
                                <Table.Th>Ações</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {planos?.map((plano) => (
                                <Table.Tr key={plano.id}>
                                    <Table.Td>{new Date(plano.data).toLocaleDateString()}</Table.Td>
                                    <Table.Td>{plano.conteudo}</Table.Td>
                                    <Table.Td>{plano.metodologia}</Table.Td>
                                    <Table.Td>{plano.tarefa_casa}</Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(plano)}>
                                                <IconEdit size={16} />
                                            </ActionIcon>
                                            <ActionIcon variant="subtle" color="red" onClick={() => { if (confirm('Excluir plano?')) deleteMutation.mutate(plano.id) }}>
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </>
            )}

            <Modal opened={opened} onClose={close} title={editingId ? "Editar Plano" : "Novo Plano"}>
                <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
                    <DateInput
                        label="Data"
                        placeholder="Data da aula"
                        required
                        mb="sm"
                        {...form.getInputProps('data')}
                    />
                    <Textarea
                        label="Conteúdo"
                        placeholder="O que será ensinado"
                        required
                        minRows={3}
                        mb="sm"
                        {...form.getInputProps('conteudo')}
                    />
                    <Textarea
                        label="Metodologia"
                        placeholder="Como será ensinado"
                        minRows={2}
                        mb="sm"
                        {...form.getInputProps('metodologia')}
                    />
                    <Textarea
                        label="Tarefa de Casa"
                        placeholder="Atividades para casa"
                        minRows={2}
                        mb="lg"
                        {...form.getInputProps('tarefa_casa')}
                    />
                    <Button fullWidth type="submit" loading={mutation.isPending}>Salvar</Button>
                </form>
            </Modal>
        </>
    );
}
