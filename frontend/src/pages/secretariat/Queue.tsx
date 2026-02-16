import { ActionIcon, Button, Group, Modal, Select, Table, Title, Text, Badge } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconTrash, IconUserPlus, IconCheck } from '@tabler/icons-react';
import { api } from '../../api/client';
import { notifications } from '@mantine/notifications';

interface ItemFila {
    id: number;
    aluno_id: number;
    aluno_nome: string;
    escola_nome: string | null;
    data_solicitacao: string;
    status: string;
}

interface Aluno {
    id: number;
    nome: string;
}

interface Escola {
    id: number;
    nome: string;
}

export default function Queue() {
    const [opened, { open, close }] = useDisclosure(false);
    const queryClient = useQueryClient();

    const form = useForm({
        initialValues: {
            aluno_id: '',
            escola_id: ''
        },
        validate: {
            aluno_id: (value) => (!value ? 'Selecione um aluno' : null),
        },
    });

    const { data: fila } = useQuery({
        queryKey: ['fila'],
        queryFn: async () => (await api.get<ItemFila[]>('/academic/fila')).data
    });

    const { data: alunos } = useQuery({
        queryKey: ['alunos'],
        queryFn: async () => (await api.get<Aluno[]>('/people/alunos')).data
    });

    const { data: escolas } = useQuery({
        queryKey: ['escolas'],
        queryFn: async () => (await api.get<Escola[]>('/pedagogical/escolas')).data
    });

    const mutation = useMutation({
        mutationFn: async (values: typeof form.values) => {
            return api.post('/academic/fila', {
                aluno_id: Number(values.aluno_id),
                escola_id: values.escola_id ? Number(values.escola_id) : null
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fila'] });
            close();
            form.reset();
            notifications.show({ title: 'Sucesso', message: 'Aluno adicionado à fila!', color: 'green' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => api.delete(`/academic/fila/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fila'] });
            notifications.show({ title: 'Sucesso', message: 'Removido da fila!', color: 'green' });
        }
    });

    return (
        <>
            <Group justify="space-between" mb="lg">
                <Title order={2}>Fila de Espera</Title>
                <Button leftSection={<IconUserPlus size={16} />} onClick={open}>Solicitar Vaga</Button>
            </Group>

            <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Data</Table.Th>
                        <Table.Th>Aluno</Table.Th>
                        <Table.Th>Escola Pretendida</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Ações</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {fila?.map((item) => (
                        <Table.Tr key={item.id}>
                            <Table.Td>{new Date(item.data_solicitacao).toLocaleDateString()}</Table.Td>
                            <Table.Td>{item.aluno_nome}</Table.Td>
                            <Table.Td>{item.escola_nome || <Text c="dimmed" size="sm">Zoneamento Automático</Text>}</Table.Td>
                            <Table.Td>
                                <Badge color={item.status === 'AGUARDANDO' ? 'yellow' : 'green'}>{item.status}</Badge>
                            </Table.Td>
                            <Table.Td>
                                <Group gap="xs">
                                    <ActionIcon variant="subtle" color="red" onClick={() => { if (confirm('Remover da fila?')) deleteMutation.mutate(item.id) }}>
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                    <Button size="xs" variant="light" leftSection={<IconCheck size={14} />}>Matricular</Button>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <Modal opened={opened} onClose={close} title="Solicitar Vaga">
                <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
                    <Select
                        label="Aluno"
                        placeholder="Selecione o aluno"
                        data={alunos?.map(a => ({ value: String(a.id), label: a.nome })) || []}
                        withAsterisk
                        searchable
                        mb="md"
                        {...form.getInputProps('aluno_id')}
                    />

                    <Select
                        label="Escola Pretendida (Opcional)"
                        placeholder="Deixe em branco para usar Zoneamento"
                        data={escolas?.map(e => ({ value: String(e.id), label: e.nome })) || []}
                        clearable
                        mb="lg"
                        {...form.getInputProps('escola_id')}
                    />

                    <Button fullWidth type="submit" loading={mutation.isPending}>Adicionar à Fila</Button>
                </form>
            </Modal>
        </>
    );
}
