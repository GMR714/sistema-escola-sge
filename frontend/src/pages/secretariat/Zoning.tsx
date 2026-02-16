import { ActionIcon, Button, Group, Modal, Select, Table, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { api } from '../../api/client';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

interface Escola {
    id: number;
    nome: string;
}

interface Zoneamento {
    id: number;
    bairro: string;
    escola_id: number;
    escola_nome: string;
}

export default function Zoning() {
    const [opened, { open, close }] = useDisclosure(false);
    const queryClient = useQueryClient();

    const form = useForm({
        initialValues: {
            bairro: '',
            escola_id: ''
        },
        validate: {
            bairro: (value) => (value.length < 2 ? 'Nome do bairro obrigatório' : null),
            escola_id: (value) => (!value ? 'Selecione uma escola' : null),
        },
    });

    const { data: escolas } = useQuery({
        queryKey: ['escolas'],
        queryFn: async () => (await api.get<Escola[]>('/pedagogical/escolas')).data
    });

    const { data: zoneamentos } = useQuery({
        queryKey: ['zoneamento'],
        queryFn: async () => (await api.get<Zoneamento[]>('/pedagogical/zoneamento')).data
    });

    const mutation = useMutation({
        mutationFn: async (values: typeof form.values) => {
            return api.post('/pedagogical/zoneamento', {
                bairro: values.bairro,
                escola_id: Number(values.escola_id)
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['zoneamento'] });
            close();
            form.reset();
            notifications.show({ title: 'Sucesso', message: 'Zoneamento salvo!', color: 'green' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => api.delete(`/pedagogical/zoneamento/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['zoneamento'] });
            notifications.show({ title: 'Sucesso', message: 'Zoneamento removido!', color: 'green' });
        }
    });

    return (
        <>
            <Group justify="space-between" mb="lg">
                <Title order={2}>Configuração de Zoneamento</Title>
                <Button leftSection={<IconPlus size={16} />} onClick={open}>Novo Mapeamento</Button>
            </Group>

            <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Bairro</Table.Th>
                        <Table.Th>Escola Vinculada</Table.Th>
                        <Table.Th>Ações</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {zoneamentos?.map((z) => (
                        <Table.Tr key={z.id}>
                            <Table.Td>{z.bairro}</Table.Td>
                            <Table.Td>{z.escola_nome}</Table.Td>
                            <Table.Td>
                                <ActionIcon variant="subtle" color="red" onClick={() => { if (confirm('Excluir?')) deleteMutation.mutate(z.id) }}>
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <Modal opened={opened} onClose={close} title="Novo Zoneamento">
                <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
                    <TextInput label="Bairro" placeholder="Nome do Bairro" withAsterisk mb="md" {...form.getInputProps('bairro')} />

                    <Select
                        label="Escola"
                        placeholder="Selecione a escola"
                        data={escolas?.map(e => ({ value: String(e.id), label: e.nome })) || []}
                        withAsterisk
                        mb="lg"
                        {...form.getInputProps('escola_id')}
                    />

                    <Button fullWidth type="submit" loading={mutation.isPending}>Salvar</Button>
                </form>
            </Modal>
        </>
    );
}
