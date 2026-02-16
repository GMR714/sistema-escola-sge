import { ActionIcon, Button, Group, Modal, Table, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { api } from '../../api/client';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

interface Disciplina {
    id: number;
    nome: string;
    codigo: string;
}

export default function Subjects() {
    const [opened, { open, close }] = useDisclosure(false);
    const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(null);
    const queryClient = useQueryClient();

    const form = useForm({
        initialValues: {
            nome: '',
            codigo: ''
        },
        validate: {
            nome: (value) => (value.length < 2 ? 'Nome deve ter pelo menos 2 caracteres' : null),
            codigo: (value) => (value.length < 2 ? 'Código deve ter pelo menos 2 caracteres' : null),
        },
    });

    const { data: disciplinas, isLoading } = useQuery({
        queryKey: ['disciplinas'],
        queryFn: async () => (await api.get<Disciplina[]>('/pedagogical/disciplinas')).data
    });

    const mutation = useMutation({
        mutationFn: async (values: typeof form.values) => {
            if (editingDisciplina) {
                return api.put(`/pedagogical/disciplinas/${editingDisciplina.id}`, values);
            } else {
                return api.post('/pedagogical/disciplinas', values);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disciplinas'] });
            close();
            form.reset();
            setEditingDisciplina(null);
            notifications.show({ title: 'Sucesso', message: 'Disciplina salva com sucesso!', color: 'green' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => api.delete(`/pedagogical/disciplinas/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disciplinas'] });
            notifications.show({ title: 'Sucesso', message: 'Disciplina excluída!', color: 'green' });
        }
    });

    const handleEdit = (disciplina: Disciplina) => {
        setEditingDisciplina(disciplina);
        form.setValues({
            nome: disciplina.nome,
            codigo: disciplina.codigo
        });
        open();
    };

    const handleCreate = () => {
        setEditingDisciplina(null);
        form.reset();
        open();
    };

    return (
        <>
            <Group justify="space-between" mb="lg">
                <Title order={2}>Gestão de Disciplinas</Title>
                <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>Nova Disciplina</Button>
            </Group>

            <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Nome</Table.Th>
                        <Table.Th>Código</Table.Th>
                        <Table.Th>Ações</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {disciplinas?.map((d) => (
                        <Table.Tr key={d.id}>
                            <Table.Td>{d.id}</Table.Td>
                            <Table.Td>{d.nome}</Table.Td>
                            <Table.Td>{d.codigo}</Table.Td>
                            <Table.Td>
                                <Group gap="xs">
                                    <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(d)}>
                                        <IconEdit size={16} />
                                    </ActionIcon>
                                    <ActionIcon variant="subtle" color="red" onClick={() => { if (confirm('Excluir?')) deleteMutation.mutate(d.id) }}>
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <Modal opened={opened} onClose={close} title={editingDisciplina ? "Editar Disciplina" : "Nova Disciplina"}>
                <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
                    <TextInput label="Nome" placeholder="Ex: Matemática" withAsterisk mb="md" {...form.getInputProps('nome')} />
                    <TextInput label="Código" placeholder="Ex: MAT" withAsterisk mb="lg" {...form.getInputProps('codigo')} />
                    <Button fullWidth type="submit" loading={mutation.isPending}>Salvar</Button>
                </form>
            </Modal>
        </>
    );
}
